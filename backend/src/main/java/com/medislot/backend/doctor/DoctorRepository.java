package com.medislot.backend.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByAvailableTrue();

    List<Doctor> findBySpecializationIgnoreCase(String specialization);
}
