package com.example.issuetracker.repository;

import com.example.issuetracker.model.Issue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends MongoRepository<Issue, String> {
    List<Issue> findAllByCreatedByOrderByCreatedAtDesc(String createdBy);
    Optional<Issue> findByIdAndCreatedBy(String id, String createdBy);
}
