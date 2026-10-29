package com.medislot.backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorIdAndAppointmentTimeGreaterThanEqualAndAppointmentTimeLessThanOrderByAppointmentTimeAsc(
        Long doctorId,
        LocalDateTime start,
        LocalDateTime end
    );

    List<Appointment> findByDoctorIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
        Long doctorId,
        LocalDateTime start,
        LocalDateTime end
    );

    List<Appointment> findByPatientNameIgnoreCaseOrderByAppointmentTimeAsc(
        String patientName
    );

    boolean existsByDoctorIdAndAppointmentTimeAndStatus(
        Long doctorId,
        LocalDateTime appointmentTime,
        String status
    );
}
