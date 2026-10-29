package com.medislot.backend.appointment;

import com.medislot.backend.doctor.Doctor;
import com.medislot.backend.doctor.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment createAppointment(@RequestBody BookingRequest request) {
        if (request.getDoctorId() == null
                || request.getPatientName() == null
                || request.getPatientName().isBlank()
                || request.getAppointmentTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor, patient name, and appointment time are required"
            );
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found"));

        if (appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatus(
                doctor.getId(), request.getAppointmentTime(), "BOOKED")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This appointment slot is already booked"
            );
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatientName(request.getPatientName().trim());
        appointment.setAppointmentTime(request.getAppointmentTime());

        return appointmentRepository.save(appointment);
    }


    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Only booked appointments can be cancelled");
        }

        if (!appointment.getAppointmentTime().isAfter(
                java.time.LocalDateTime.now().plusHours(2))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cancellation must be more than 2 hours before the appointment");
        }

        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }

    @PutMapping("/{id}/reschedule")
    public Appointment rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only booked appointments can be rescheduled");
        }

        if (!appointment.getAppointmentTime().isAfter(
                java.time.LocalDateTime.now().plusHours(2))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rescheduling must be more than 2 hours before the appointment");
        }

        if (request.getAppointmentTime() == null ||
                !request.getAppointmentTime().isAfter(java.time.LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New appointment time must be in the future");
        }

        Long newDoctorId = request.getDoctorId() != null
                ? request.getDoctorId()
                : appointment.getDoctor().getId();

        Doctor newDoctor = doctorRepository.findById(newDoctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Doctor not found"));

        boolean conflict = appointmentRepository
                .existsByDoctorIdAndAppointmentTimeAndStatus(
                        newDoctorId, request.getAppointmentTime(), "BOOKED");

        if (conflict && !(newDoctorId.equals(appointment.getDoctor().getId())
                && request.getAppointmentTime().equals(appointment.getAppointmentTime()))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "This appointment slot is already booked");
        }

        appointment.setDoctor(newDoctor);
        appointment.setAppointmentTime(request.getAppointmentTime());

        return appointmentRepository.save(appointment);
    }

    @GetMapping("/patient/{patientName}")
    public List<Appointment> getPatientAppointments(
            @PathVariable String patientName) {
        return appointmentRepository
                .findByPatientNameIgnoreCaseOrderByAppointmentTimeAsc(patientName);
    }

    @GetMapping("/doctor/{doctorId}/today")
    public List<Appointment> getTodayAppointments(
            @PathVariable Long doctorId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDateTime start = today.atStartOfDay();
        java.time.LocalDateTime end = today.plusDays(1).atStartOfDay();

        if (!doctorRepository.existsById(doctorId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Doctor not found");
        }

        return appointmentRepository
                .findByDoctorIdAndAppointmentTimeGreaterThanEqualAndAppointmentTimeLessThanOrderByAppointmentTimeAsc(
                        doctorId, start, end);
    }

    @PutMapping("/{id}/status")
    public Appointment updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only booked appointments can have their status updated");
        }

        if (request.getStatus() == null ||
                !java.util.Set.of("COMPLETED", "NO_SHOW")
                        .contains(request.getStatus().toUpperCase())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be COMPLETED or NO_SHOW");
        }

        appointment.setStatus(request.getStatus().toUpperCase());
        return appointmentRepository.save(appointment);
    }

    public static class StatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    public static class BookingRequest {
        private Long doctorId;
        private String patientName;
        private java.time.LocalDateTime appointmentTime;

        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) {
            this.patientName = patientName;
        }

        public java.time.LocalDateTime getAppointmentTime() {
            return appointmentTime;
        }
        public void setAppointmentTime(
                java.time.LocalDateTime appointmentTime) {
            this.appointmentTime = appointmentTime;
        }
    }
}
