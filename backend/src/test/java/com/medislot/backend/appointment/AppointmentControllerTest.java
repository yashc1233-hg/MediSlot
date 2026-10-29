package com.medislot.backend.appointment;

import com.medislot.backend.doctor.Doctor;
import com.medislot.backend.doctor.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentControllerTest {

    private AppointmentRepository appointmentRepository;
    private DoctorRepository doctorRepository;
    private AppointmentController controller;
    private Doctor doctor;

    @BeforeEach
    void setUp() {
        appointmentRepository = mock(AppointmentRepository.class);
        doctorRepository = mock(DoctorRepository.class);
        doctor = mock(Doctor.class);

        when(doctor.getId()).thenReturn(1L);
        when(doctorRepository.findById(1L))
                .thenReturn(Optional.of(doctor));

        controller = new AppointmentController(
                appointmentRepository, doctorRepository);
    }

    @Test
    void bookingRejectsMissingPatientName() {
        AppointmentController.BookingRequest request =
                new AppointmentController.BookingRequest();
        request.setDoctorId(1L);
        request.setAppointmentTime(LocalDateTime.now().plusDays(1));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> controller.createAppointment(request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void bookingRejectsAlreadyBookedSlot() {
        LocalDateTime time = LocalDateTime.now().plusDays(1);
        AppointmentController.BookingRequest request =
                new AppointmentController.BookingRequest();
        request.setDoctorId(1L);
        request.setPatientName("Test Patient");
        request.setAppointmentTime(time);

        when(appointmentRepository
                .existsByDoctorIdAndAppointmentTimeAndStatus(
                        1L, time, "BOOKED"))
                .thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> controller.createAppointment(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void cancellationRejectsAppointmentWithinTwoHours() {
        Appointment appointment = new Appointment();
        appointment.setStatus("BOOKED");
        appointment.setAppointmentTime(LocalDateTime.now().plusHours(1));

        when(appointmentRepository.findById(1L))
                .thenReturn(Optional.of(appointment));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> controller.cancelAppointment(1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void cancellationSucceedsMoreThanTwoHoursBeforeAppointment() {
        Appointment appointment = new Appointment();
        appointment.setStatus("BOOKED");
        appointment.setAppointmentTime(LocalDateTime.now().plusHours(3));

        when(appointmentRepository.findById(1L))
                .thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment))
                .thenReturn(appointment);

        Appointment result = controller.cancelAppointment(1L);

        assertEquals("CANCELLED", result.getStatus());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void statusUpdateRejectsInvalidStatus() {
        Appointment appointment = new Appointment();
        appointment.setStatus("BOOKED");

        when(appointmentRepository.findById(1L))
                .thenReturn(Optional.of(appointment));

        AppointmentController.StatusRequest request =
                new AppointmentController.StatusRequest();
        request.setStatus("INVALID");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> controller.updateAppointmentStatus(1L, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(appointmentRepository, never()).save(any());
    }
}
