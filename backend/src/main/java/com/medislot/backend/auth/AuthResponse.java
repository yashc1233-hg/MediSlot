package com.medislot.backend.auth;

public record AuthResponse(
        Long id,
        String username,
        String email,
        String message
) {
}
