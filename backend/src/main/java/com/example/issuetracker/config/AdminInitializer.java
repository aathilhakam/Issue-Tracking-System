package com.example.issuetracker.config;

import com.example.issuetracker.model.User;
import com.example.issuetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    @Value("${app.admin.name}") private String adminName;
    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;

    public AdminInitializer(UserRepository users) { this.users = users; }

    @Override
    public void run(String... args) {
        users.findByEmailIgnoreCase(adminEmail).ifPresentOrElse(existing -> {
            existing.setName(adminName);
            existing.setRole("ADMIN");
            if (!encoder.matches(adminPassword, existing.getPassword())) {
                existing.setPassword(encoder.encode(adminPassword));
            }
            users.save(existing);
        }, () -> {
            User admin = new User();
            admin.setName(adminName);
            admin.setEmail(adminEmail.toLowerCase());
            admin.setPassword(encoder.encode(adminPassword));
            admin.setRole("ADMIN");
            users.save(admin);
        });
    }
}
