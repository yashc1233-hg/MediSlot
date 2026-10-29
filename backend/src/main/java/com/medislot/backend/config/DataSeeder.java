package com.medislot.backend.config;

import com.medislot.backend.doctor.Doctor;
import com.medislot.backend.doctor.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDoctors(DoctorRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Doctor("Dr. Asha Patel", "Cardiology"));
                repository.save(new Doctor("Dr. Rahul Shah", "Dermatology"));
                repository.save(new Doctor("Dr. Neha Desai", "Pediatrics"));
                System.out.println("MediSlot: 3 demo doctors added.");
            }
        };
    }
}
