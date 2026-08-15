package com.example.issuetracker.model;

import java.time.LocalDateTime;

public class Activity {
    private String message;
    private String createdAt;

    public Activity() {}
    public Activity(String message) {
        this.message = message;
        this.createdAt = LocalDateTime.now().toString();
    }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
