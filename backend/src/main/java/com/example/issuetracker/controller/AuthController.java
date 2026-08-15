package com.example.issuetracker.controller;

import com.example.issuetracker.model.User;
import com.example.issuetracker.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Value("${app.admin.registration-code}") private String adminRegistrationCode;
    public AuthController(UserRepository users) { this.users = users; }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody User user) {
        String email = user.getEmail().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        user.setEmail(email);
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = users.save(user);
        return userResponse(saved);
    }

    @PostMapping("/register-admin")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> registerAdmin(@Valid @RequestBody AdminRegistrationRequest request) {
        if (!adminRegistrationCode.equals(request.registrationCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin registration code");
        }
        String email = request.email().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User admin = new User();
        admin.setName(request.name());
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setRole("ADMIN");
        return userResponse(users.save(admin));
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .filter(found -> passwordEncoder.matches(request.password(), found.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return userResponse(user);
    }

    private Map<String, String> userResponse(User user) {
        return Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole());
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AdminRegistrationRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String registrationCode) {}
}
