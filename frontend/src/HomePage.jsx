import './HomePage.css'

export default function HomePage({ onGetStarted }) {
  return (
    <div className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#home">
          <img src="/medislot-medical-logo.png" alt="MediSlot logo" />
          <span>MediSlot</span>
        </a>
        <nav>
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="home-login" onClick={onGetStarted}>
          Sign in / Register
        </button>
      </header>

      <main>
        <section className="home-hero" id="home">
          <div className="hero-copy">
            <span className="hero-tag">YOUR HEALTH, YOUR TIME</span>
            <h1>Healthcare appointments, <span>made simple.</span></h1>
            <p>
              Find a doctor, choose a convenient appointment time, and manage
              your clinic visits in one simple place.
            </p>
            <button className="hero-button" onClick={onGetStarted}>
              Book an appointment <span aria-hidden="true">→</span>
            </button>
            <div className="hero-points">
              <span>✓ Easy scheduling</span>
              <span>✓ Manage appointments</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Healthcare illustration">
            <div className="hero-circle">
              <div className="medical-cross">+</div>
              <div className="hero-card">
                <span className="hero-card-icon">♥</span>
                <div>
                  <strong>Your care, organized</strong>
                  <small>Appointments in one place</small>
                </div>
              </div>
              <div className="hero-mini-card">
                <span>✓</span> Simple booking
              </div>
            </div>
          </div>
        </section>

        <section className="home-services" id="services">
          <div className="section-heading">
            <span>WHY MEDISLOT?</span>
            <h2>Less waiting. More caring.</h2>
            <p>Tools to help make your clinic visits easier to manage.</p>
          </div>
          <div className="service-grid">
            <article className="service-card">
              <div className="service-icon">⌕</div>
              <h3>Find a doctor</h3>
              <p>Explore available doctors and choose the care you need.</p>
            </article>
            <article className="service-card">
              <div className="service-icon">▦</div>
              <h3>Choose a time</h3>
              <p>Pick an available appointment slot that fits your schedule.</p>
            </article>
            <article className="service-card">
              <div className="service-icon">♡</div>
              <h3>Manage your visits</h3>
              <p>Keep track of upcoming and previous appointments.</p>
            </article>
          </div>
        </section>

        <section className="home-how" id="how-it-works">
          <span>GET STARTED IN THREE STEPS</span>
          <h2>Your next appointment starts here.</h2>
          <div className="steps-grid">
            <div><b>01</b><h3>Create an account</h3><p>Sign in or register to access your appointments.</p></div>
            <div><b>02</b><h3>Select a doctor</h3><p>Choose a doctor and an available time slot.</p></div>
            <div><b>03</b><h3>Manage your booking</h3><p>Review your visit details from your dashboard.</p></div>
          </div>
          <button className="hero-button" onClick={onGetStarted}>Get started →</button>
        </section>

        <section className="home-contact" id="contact">
          <div>
            <span>HERE TO HELP</span>
            <h2>Make time for your health.</h2>
            <p>Use MediSlot to organize your clinic appointments in one place.</p>
          </div>
          <button className="home-login" onClick={onGetStarted}>Continue to MediSlot</button>
        </section>
      </main>

      <footer className="home-footer">
        <a className="home-brand" href="#home">
          <img src="/medislot-medical-logo.png" alt="" />
          <span>MediSlot</span>
        </a>
        <p>Simple scheduling, better care.</p>
        <small>© 2026 MediSlot</small>
      </footer>
    </div>
  )
}
