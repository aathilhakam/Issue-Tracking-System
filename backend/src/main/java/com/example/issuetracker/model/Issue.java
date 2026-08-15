package com.example.issuetracker.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "issues")
public class Issue {
    @Id
    private String id;
    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title must be 120 characters or fewer")
    private String title;
    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be 2000 characters or fewer")
    private String description;
    @Pattern(regexp = "Bug / Defect|Feature Request|Enhancement|UI/UX|Security|Performance|Database|API / Integration|Testing / QA|Deployment / DevOps|Documentation|Project / Task Management", message = "Invalid issue type")
    private String issueType = "Bug / Defect";
    @Pattern(regexp = "Low|Medium|High|Critical", message = "Invalid priority")
    private String priority = "Medium";
    @Pattern(regexp = "Open|In Progress|Resolved|Closed", message = "Invalid status")
    private String status = "Open";
    private String assignee;
    @NotBlank(message = "Due date is required")
    private String dueDate;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String lastStatusUpdatedBy = "USER";
    @Transient private String creatorName;
    @Transient private String creatorEmail;
    private List<Comment> comments = new ArrayList<>();
    private List<Activity> activities = new ArrayList<>();

    public Issue() {
        String now = LocalDateTime.now().toString();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void addComment(Comment comment) { getComments().add(comment); }
    public void addActivity(String message) { getActivities().add(new Activity(message)); }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getLastStatusUpdatedBy() { return lastStatusUpdatedBy == null ? "USER" : lastStatusUpdatedBy; }
    public void setLastStatusUpdatedBy(String lastStatusUpdatedBy) { this.lastStatusUpdatedBy = lastStatusUpdatedBy; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public String getCreatorEmail() { return creatorEmail; }
    public void setCreatorEmail(String creatorEmail) { this.creatorEmail = creatorEmail; }
    public List<Comment> getComments() {
        if (comments == null) comments = new ArrayList<>();
        return comments;
    }
    public void setComments(List<Comment> comments) { this.comments = comments; }
    public List<Activity> getActivities() {
        if (activities == null) activities = new ArrayList<>();
        return activities;
    }
    public void setActivities(List<Activity> activities) { this.activities = activities; }
}
