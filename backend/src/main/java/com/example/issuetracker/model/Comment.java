package com.example.issuetracker.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class Comment {
    @NotBlank(message = "Comment author is required")
    private String author;
    @NotBlank(message = "Comment text is required")
    @Size(max = 1000, message = "Comment must be 1000 characters or fewer")
    private String text;
    private String createdAt = LocalDateTime.now().toString();

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
