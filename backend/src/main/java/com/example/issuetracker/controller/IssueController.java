package com.example.issuetracker.controller;

import com.example.issuetracker.model.Comment;
import com.example.issuetracker.model.Issue;
import com.example.issuetracker.repository.IssueRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueController {
    private static final Map<String, String> ASSIGNEES_BY_TYPE = Map.ofEntries(
            Map.entry("Bug / Defect", "Software Developer / QA Engineer"),
            Map.entry("Feature Request", "Software Developer / Development Team"),
            Map.entry("Enhancement", "Software Developer"),
            Map.entry("UI/UX", "UI/UX Designer + Frontend Developer"),
            Map.entry("Security", "Security Engineer / Backend Developer"),
            Map.entry("Performance", "Backend Developer / DevOps Engineer"),
            Map.entry("Database", "Database Developer / Backend Developer"),
            Map.entry("API / Integration", "Backend Developer"),
            Map.entry("Testing / QA", "QA Engineer / Tester"),
            Map.entry("Deployment / DevOps", "DevOps Engineer"),
            Map.entry("Documentation", "Technical Writer / Developer"),
            Map.entry("Project / Task Management", "Project Manager / Scrum Master")
    );
    private final IssueRepository repository;
    public IssueController(IssueRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Issue> getAllIssues(@RequestHeader("X-User-Id") String userId) {
        return repository.findAllByCreatedByOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/{id}")
    public Issue getIssue(@PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        return findIssue(id, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Issue createIssue(@Valid @RequestBody Issue issue, @RequestHeader("X-User-Id") String userId) {
        issue.setId(null);
        issue.setStatus("Open");
        issue.setLastStatusUpdatedBy("USER");
        issue.setAssignee(ASSIGNEES_BY_TYPE.get(issue.getIssueType()));
        String now = LocalDateTime.now().toString();
        issue.setCreatedAt(now);
        issue.setUpdatedAt(now);
        issue.setCreatedBy(userId);
        issue.getComments().clear();
        issue.getActivities().clear();
        issue.addActivity("Issue created with status " + issue.getStatus());
        return repository.save(issue);
    }

    @PutMapping("/{id}")
    public Issue updateIssue(@PathVariable String id, @Valid @RequestBody Issue changes,
                             @RequestHeader("X-User-Id") String userId) {
        Issue issue = findIssue(id, userId);
        if (!List.of("Open", "Closed").contains(changes.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Users can only set ticket status to Open or Closed");
        }
        if (!issue.getStatus().equals(changes.getStatus())) {
            issue.addActivity("Status changed from " + issue.getStatus() + " to " + changes.getStatus());
            issue.setLastStatusUpdatedBy("USER");
        }
        issue.setTitle(changes.getTitle());
        issue.setDescription(changes.getDescription());
        issue.setIssueType(changes.getIssueType());
        issue.setPriority(changes.getPriority());
        issue.setStatus(changes.getStatus());
        issue.setAssignee(ASSIGNEES_BY_TYPE.get(changes.getIssueType()));
        issue.setDueDate(changes.getDueDate());
        issue.setUpdatedAt(LocalDateTime.now().toString());
        issue.addActivity("Issue details updated");
        return repository.save(issue);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment addComment(@PathVariable String id, @Valid @RequestBody Comment comment,
                              @RequestHeader("X-User-Id") String userId) {
        Issue issue = findIssue(id, userId);
        comment.setCreatedAt(LocalDateTime.now().toString());
        issue.addComment(comment);
        issue.addActivity("Comment added by " + comment.getAuthor());
        issue.setUpdatedAt(LocalDateTime.now().toString());
        repository.save(issue);
        return comment;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(@PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        repository.delete(findIssue(id, userId));
    }

    private Issue findIssue(String id, String userId) {
        return repository.findByIdAndCreatedBy(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    }
}
