import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  const toggleTheme = () => {
    const t = theme === 'light' ? 'dark' : 'light';
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const features = [
    { icon: '📧', title: 'Smart Email Reading', desc: 'AI reads your inbox, extracts tasks, ignores promotions. Only business emails become tasks.' },
    { icon: '📅', title: 'Auto-Scheduling', desc: 'Approved tasks get scheduled in your Google Calendar automatically with Meet links.' },
    { icon: '🤖', title: '3 Intelligent Agents', desc: 'Email Agent, Scheduler Agent, and Notification Agent work together seamlessly.' },
    { icon: '⚡', title: 'Priority Intelligence', desc: 'High priority meetings automatically bump lower priority tasks to next available slot.' },
    { icon: '🌍', title: 'Timezone Aware', desc: 'Detects sender timezone from email headers. Schedules meetings at the right time for everyone.' },
    { icon: '🔔', title: 'Smart Notifications', desc: 'Senders get notified when tasks complete. Rejections trigger 3 alternate time suggestions.' },
    { icon: '📎', title: 'Attachment Processing', desc: 'PDF and file attachments stored and accessible directly from task detail view.' },
    { icon: '🛡️', title: 'Secure & Audited', desc: 'JWT authentication, role-based access, and full audit trail for every action.' },
  ];

  const plans = [
    { name: 'Free Trial', price: '₹0', period: '7 days', color: 'var(--text-primary)', features: ['Full access to all features', 'Connect 1 Gmail account', 'Google Calendar sync', 'Up to 50 tasks', 'No credit card required'], cta: 'Start Free Trial', ctaAction: () => navigate('/register'), featured: false },
    { name: 'Monthly', price: '₹999', period: '/month', color: 'var(--gold)', features: ['Unlimited tasks', 'Gmail + Calendar sync', 'Google Meet auto-links', 'Priority email support', 'Cancel anytime'], cta: 'Get Started', ctaAction: () => navigate('/register'), featured: true },
    { name: 'Yearly', price: '₹8,999', period: '/year', color: 'var(--green)', features: ['Everything in Monthly', 'Save 25% vs monthly', 'Early feature access', 'Dedicated support', 'Usage analytics dashboard'], cta: 'Best Value', ctaAction: () => navigate('/register'), featured: false },
  ];

  const steps = [
    { num: '01', title: 'Register & connect Gmail', desc: 'Create your account and connect your Gmail with one click. Takes 2 minutes.' },
    { num: '02', title: 'Emails processed automatically', desc: 'AI reads your inbox every 60 seconds. Business emails become actionable tasks instantly.' },
    { num: '03', title: 'Approve or reject tasks', desc: 'Review AI-extracted tasks in your dashboard. Approve to schedule, reject to get alternate slots.' },
    { num: '04', title: 'Everything handled for you', desc: 'Calendar events created, Meet links generated, senders notified. Zero manual work.' },
  ];

  const s = {
    section: { maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' },
    h2: { fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'center' },
    sub: { fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '540px', margin: '0 auto 48px', lineHeight: '1.7' },
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'var(--bg-secondary)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display, serif' }}>S</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>SecretaryAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '20px', padding: '5px 10px', cursor: 'pointer', fontSize: '14px' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 16px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Login</button>
          <button onClick={() => navigate('/register')} style={{ background: 'var(--gold)', border: 'none', borderRadius: '8px', padding: '8px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(157,123,47,0.3)' }}>Start Free Trial</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 50% 40%, rgba(157,123,47,0.06) 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '760px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: '20px', padding: '4px 14px', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '500' }}>Powered by LLaMA 3.3 + Google Calendar</span>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.15', marginBottom: '20px' }}>
            Your AI Executive<br />
            <span style={{ color: 'var(--gold)' }}>Secretary</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '36px', maxWidth: '560px', margin: '0 auto 36px' }}>
            Emails become tasks. Tasks become calendar events. Senders get notified. All automatically — while you focus on what matters.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: 'var(--gold)', border: 'none', borderRadius: '10px', padding: '14px 32px', color: '#fff', fontWeight: '600', fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(157,123,47,0.3)', transition: 'transform 0.15s' }} onMouseEnter={e => e.target.style.transform='translateY(-1px)'} onMouseLeave={e => e.target.style.transform='translateY(0)'}>
              Start 7-Day Free Trial
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 32px', color: 'var(--text-primary)', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Sign In
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '14px' }}>No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[['3', 'AI Agents'], ['60s', 'Poll Interval'], ['100%', 'Automated'], ['0', 'Manual Work']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono, monospace', marginBottom: '4px' }}>{val}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={s.section}>
        <h2 style={s.h2}>How it works</h2>
        <p style={s.sub}>Four steps from email to done. No manual scheduling, no back-and-forth.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {steps.map(({ num, title, desc }) => (
            <div key={num} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px 24px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--border)', fontFamily: 'DM Mono, monospace', position: 'absolute', top: '12px', right: '16px', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', paddingRight: '40px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={s.section}>
          <h2 style={s.h2}>Everything you need</h2>
          <p style={s.sub}>Built for executives who value their time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={s.section}>
        <h2 style={s.h2}>Simple pricing</h2>
        <p style={s.sub}>Start free. Upgrade when you're ready. No hidden fees.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {plans.map(({ name, price, period, features: fs, cta, ctaAction, featured }) => (
            <div key={name} style={{ background: 'var(--bg-secondary)', border: featured ? `2px solid var(--gold)` : '1px solid var(--border)', borderRadius: '16px', padding: '28px 24px', position: 'relative', boxShadow: featured ? 'var(--shadow-md)' : 'var(--shadow-sm)', transform: featured ? 'scale(1.02)' : 'scale(1)' }}>
              {featured && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 14px', borderRadius: '12px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>{name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}>{price}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {fs.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={ctaAction} style={{ width: '100%', background: featured ? 'var(--gold)' : 'var(--bg-primary)', border: `1px solid ${featured ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '10px', padding: '12px', color: featured ? '#fff' : 'var(--text-primary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', boxShadow: featured ? '0 4px 12px rgba(157,123,47,0.25)' : 'none' }}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: 'var(--gold)', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Ready to reclaim your time?</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '28px' }}>Start your 7-day free trial. No credit card required.</p>
        <button onClick={() => navigate('/register')} style={{ background: '#fff', border: 'none', borderRadius: '10px', padding: '14px 36px', color: 'var(--gold)', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--gold)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display, serif' }}>S</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>SecretaryAI</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Built with FastAPI · React · Groq · Google Calendar API</p>
      </div>

    </div>
  );
};

export default Landing;