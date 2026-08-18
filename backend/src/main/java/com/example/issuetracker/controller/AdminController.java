package com.example.issuetracker.controller;

import com.example.issuetracker.model.Issue;
import com.example.issuetracker.model.User;
import com.example.issuetracker.repository.IssueRepository;
import com.example.issuetracker.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.issuetracker.model.Comment;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final IssueRepository issues;
    private final UserRepository users;

    public AdminController(IssueRepository issues, UserRepository users) {
        this.issues = issues;
        this.users = users;
    }

    @GetMapping("/issues")
    public List<Issue> getAllIssues(@RequestHeader("X-User-Id") String userId) {
        requireAdmin(userId);
        List<Issue> allIssues = issues.findAll();
        Map<String, User> creators = users.findAllById(allIssues.stream()
                        .map(Issue::getCreatedBy).filter(id -> id != null && !id.isBlank()).toList())
                .stream().collect(Collectors.toMap(User::getId, Function.identity()));
        allIssues.forEach(issue -> addCreatorDetails(issue, creators.get(issue.getCreatedBy())));
        return allIssues;
    }

    @PutMapping("/issues/{id}/status")
    public Issue updateStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request,
                              @RequestHeader("X-User-Id") String userId) {
        requireAdmin(userId);
        Issue issue = issues.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        if (!issue.getStatus().equals(request.status())) {
            issue.addActivity("Administrator changed status from " + issue.getStatus() + " to " + request.status());
            issue.setStatus(request.status());
            issue.setLastStatusUpdatedBy("ADMIN");
            issue.setUpdatedAt(LocalDateTime.now().toString());
            Issue saved = issues.save(issue);
            if (saved.getCreatedBy() == null || saved.getCreatedBy().isBlank()) {
                addCreatorDetails(saved, null);
            } else {
                users.findById(saved.getCreatedBy()).ifPresentOrElse(
                        creator -> addCreatorDetails(saved, creator),
                        () -> addCreatorDetails(saved, null));
            }
            return saved;
        }
        return issue;
    }

    @PostMapping("/issues/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment addComment(@PathVariable String id, @Valid @RequestBody Comment comment,
                              @RequestHeader("X-User-Id") String userId) {
        requireAdmin(userId);
        Issue issue = issues.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        comment.setCreatedAt(LocalDateTime.now().toString());
        issue.addComment(comment);
        issue.addActivity("Comment added by " + comment.getAuthor());
        issue.setUpdatedAt(LocalDateTime.now().toString());
        issues.save(issue);
        return comment;
    }

    private void requireAdmin(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access required");
        }
    }

    private void addCreatorDetails(Issue issue, User creator) {
        if (creator == null) {
            issue.setCreatorName("Unknown user");
            issue.setCreatorEmail("");
            return;
        }
        issue.setCreatorName(creator.getName());
        issue.setCreatorEmail(creator.getEmail());
    }

    public record StatusRequest(
            @NotBlank(message = "Status is required")
            @Pattern(regexp = "Open|In Progress|Resolved|Closed", message = "Invalid status") String status) {}
}
