import { useEffect, useState } from 'react'
import './App.css'
import AuthPage from './AuthPage'
import HomePage from './HomePage'
const API = 'http://localhost:8080/api'

const MIN_APPOINTMENT_DATETIME = (() => { const now = new Date(); now.setMinutes(now.getMinutes() + 5 - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); })()

function App() {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patientName, setPatientName] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showHome, setShowHome] = useState(true)

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (active) setAuthUser(null)
          return
        }

        const user = await response.json()
        if (active) setAuthUser(user)
      } catch (error) {
        console.error('Session check failed:', error)
        if (active) setAuthUser(null)
      } finally {
        if (active) setAuthChecked(true)
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [])

  async function loadData() {
    try {
      const [doctorResponse, appointmentResponse] = await Promise.all([
        fetch(`${API}/doctors`),
        fetch(`${API}/appointments`)
      ])
      if (!doctorResponse.ok || !appointmentResponse.ok) {
        throw new Error('Could not load data. Check whether the backend is running.')
      }
      setDoctors(await doctorResponse.json())
      setAppointments(await appointmentResponse.json())
    } catch (error) {
      setMessage(error.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  async function bookAppointment(event) {
    event.preventDefault()
    setMessage('')

    if (!doctorId || !patientName.trim() || !appointmentTime) {
      setMessage('Please complete all booking fields.')
      return
    }

    try {
      const response = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: Number(doctorId),
          patientName: patientName.trim(),
          appointmentTime: appointmentTime.length === 16
            ? `${appointmentTime}:00`
            : appointmentTime
        })
      })
      if (!response.ok) {
        const error = await response.text()
        console.error('Booking failed:', { doctorId, patientName, appointmentTime, error }); setMessage('Booking error: ' + error + ' | Doctor: ' + doctorId + ' | Time: ' + appointmentTime)
        throw new Error('Server: ' + error + ' | Doctor ID: ' + doctorId + ' | Patient: ' + patientName + ' | Appointment time: ' + appointmentTime)
      }
      setMessage('Appointment booked successfully!')
      setPatientName('')
      setDoctorId('')
      setAppointmentTime('')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Booking failed.')
    }
  }

  async function cancelAppointment(id) {
    try {
      const response = await fetch(`${API}/appointments/${id}/cancel`, {
        method: 'PUT'
      })
      if (!response.ok) throw new Error(await response.text())
      setMessage('Appointment cancelled successfully.')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Cancellation failed.')
    }
  }

  const upcoming = appointments.filter(
    appointment => appointment.status === 'BOOKED'
  )

  if (!authChecked) {
    return <div className="auth-page">Checking your session...</div>
  }

  if (showHome) {
    return <HomePage onGetStarted={() => setShowHome(false)} />
  }

  if (!authUser) {
    return <AuthPage onLogin={setAuthUser} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="dashboard-logo" src="/medislot-medical-logo.png" alt="MediSlot logo" />
          <span>Medi<span className="brand-accent">Slot</span></span>
        </div>
        <p className="sidebar-label">WORKSPACE</p>
        <a className="nav-link active" href="#overview"> <span>Overview</span></a>
        <a className="nav-link" href="#book"> <span>Book appointment</span></a>
        <a className="nav-link" href="#appointments"> <span>Appointments</span></a>
        <a className="nav-link" href="#doctors"> <span>Our doctors</span></a>
        <div className="sidebar-bottom">
          <div className="help-icon">?</div>
          <div><strong>Need assistance?</strong><p>Contact your clinic team.</p></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="profile"><img className="profile-logo" src="/medislot-medical-logo.png" alt="MediSlot logo" /><div><strong>MediSlot</strong><small>Appointment portal</small></div></div>
        </header>

        <section className="welcome" id="overview">
          <div>
            <p className="eyebrow">YOUR HEALTH, YOUR TIME</p>
            <h1>Good health starts here.</h1>
            <p className="welcome-text">Find the right specialist and schedule your next appointment with ease.</p>
          </div>
          <div className="welcome-symbol"> </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-icon teal"> </div><p>Available doctors</p><h2>{doctors.length}</h2><span>Specialists ready to help</span></article>
          <article className="stat-card"><div className="stat-icon blue"> </div><p>Total appointments</p><h2>{appointments.length}</h2><span>All recorded appointments</span></article>
          <article className="stat-card"><div className="stat-icon purple"> </div><p>Active bookings</p><h2>{upcoming.length}</h2><span>Currently booked</span></article>
        </section>

        {message && <div className="message" role="status">{message}</div>}

        <section className="content-grid">
          <article className="panel booking-panel" id="book">
            <div className="panel-heading"><div><p className="eyebrow">GET STARTED</p><h2>Book an appointment</h2></div><span aria-hidden="true">-</span></div>
            <p className="panel-description">Choose your specialist and preferred time.</p>
            <form onSubmit={bookAppointment}>
              <label htmlFor="patientName">Patient full name</label>
              <input id="patientName" value={patientName} onChange={event => setPatientName(event.target.value)} placeholder="Enter your full name" required />
              <label htmlFor="doctor">Choose a doctor</label>
              <select id="doctor" value={doctorId} onChange={event => setDoctorId(event.target.value)} required>
                <option value="">Select a specialist</option>
                {doctors.filter(doctor => doctor.available).map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.name}  </option>)}
              </select>
              <label htmlFor="appointmentTime">Preferred date and time</label>
              <input id="appointmentTime" type="datetime-local" min={MIN_APPOINTMENT_DATETIME} value={appointmentTime} onChange={event => setAppointmentTime(event.target.value)} required />
              <button className="primary-button" type="submit">Confirm appointment</button>
            </form>
            <p className="secure-note">Your appointment details are handled by the clinic.</p>
          </article>

          <article className="panel doctors-panel" id="doctors">
            <div className="panel-heading"><div><p className="eyebrow">OUR MEDICAL TEAM</p><h2>Meet our doctors</h2></div><span className="doctor-count">{doctors.length} doctors</span></div>
            <p className="panel-description">Experienced specialists for your care.</p>
            {loading ? <p>Loading doctors...</p> : doctors.length === 0 ? <p>No doctors found.</p> : doctors.map((doctor, index) => (
              <div className="doctor-row" key={doctor.id}>
                <div className={`doctor-avatar avatar-${index % 3}`}>{doctor.name.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('')}</div>
                <div className="doctor-info"><strong>{doctor.name}</strong><span>{doctor.specialization}</span></div>
                <span className={`availability ${doctor.available ? '' : 'unavailable'}`}>{doctor.available ? 'Available' : 'Unavailable'}</span>
              </div>
            ))}
            <div className="care-note"><span>[ ]</span><div><strong>Care that fits your schedule</strong><p>Choose a doctor and request a suitable appointment time.</p></div></div>
          </article>
        </section>

        <section className="panel appointments-panel" id="appointments">
          <div className="panel-heading"><div><p className="eyebrow">BOOKING OVERVIEW</p><h2>Recent appointments</h2></div><button className="refresh-button" type="button" onClick={loadData}>Refresh Refresh</button></div>
          {loading ? <p>Loading appointments...</p> : appointments.length === 0 ? <div className="empty-state"><span>[ ]</span><strong>No appointments yet</strong><p>Your bookings will appear here after you schedule one.</p></div> : (
            <div className="table-wrap"><table><thead><tr><th>PATIENT</th><th>DOCTOR</th><th>DATE & TIME</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
              {[...appointments].sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)).map(appointment => (
                <tr key={appointment.id}>
                  <td><strong>{appointment.patientName}</strong></td>
                  <td>{appointment.doctor?.name || `Doctor #${appointment.doctor?.id || ''}`}</td>
                  <td>{new Date(appointment.appointmentTime).toLocaleString()}</td>
                  <td><span className={`status status-${String(appointment.status).toLowerCase()}`}>{appointment.status}</span></td>
                  <td>{appointment.status === 'BOOKED' && <button className="cancel-button" type="button" onClick={() => cancelAppointment(appointment.id)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </section>
        <footer>Copyright 2026 MediSlot - Simple scheduling, better care.</footer>
      </main>
    </div>
  )
}

export default App








