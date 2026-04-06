import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';

const steps = ['Create Account', 'Connect Gmail', 'Set Hours'];

const Onboarding = () => {
  // const [step, setStep] = useState(2);
  const [step, setStep] = useState(2); 
  const [gmailConnected, setGmailConnected] = useState(false);
  const [hoursForm, setHoursForm] = useState({ work_start_hour: 9, work_end_hour: 18, work_days: '1,2,3,4,5', slot_interval_minutes: 30 });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Logic to check if we just returned from Google
    if (params.get('gmail') === 'connected') {
      setGmailConnected(true);
      setStep(3); // Move to Set Hours automatically
    }

    // New: Check if the user is the Admin (You) to skip step 2 if desired
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email === "arvindchoudhary0809@gmail.com") {
        // You can skip to step 3 for yourself since we fixed your token manually
        // setStep(3); 
    }
  }, []);

  const connectGmail = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }
    const res = await axios.get('http://127.0.0.1:8000/auth/gmail/connect', {
      headers: { Authorization: `Bearer ${token}` }
    });
    window.location.href = res.data.auth_url;
  } catch (err) {
    console.error('Connect error:', err.response?.status, err.response?.data);
    if (err.response?.status === 401) {
      alert('Session expired. Please login again.');
      navigate('/login');
    }
  }
};

  const saveAndFinish = async () => {
    setSaving(true);
    try {
      // This saves the hours to your SQLite dev.db for this specific user
      await api.post('/settings/', hoursForm);
      
      // Update local user object to show onboarding is complete
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.onboarding_complete = true;
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // ... [Keep your existing styles (card, btn, DAYS, toggleDay) exactly as they are] ...
  const card = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px' };
  const btn = { background: 'var(--gold)', border: 'none', borderRadius: '10px', padding: '13px 24px', color: '#fff', fontWeight: '600', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', width: '100%', marginTop: '8px' };

  const DAYS = [{ l: 'M', v: 1 }, { l: 'T', v: 2 }, { l: 'W', v: 3 }, { l: 'T', v: 4 }, { l: 'F', v: 5 }, { l: 'S', v: 6 }, { l: 'S', v: 7 }];
  const activeDays = hoursForm.work_days.split(',').map(Number);
  const toggleDay = (v) => {
    const days = activeDays.includes(v) ? activeDays.filter(d => d !== v) : [...activeDays, v].sort();
    setHoursForm({ ...hoursForm, work_days: days.join(',') });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div style={{ width: '36px', height: '36px', background: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display, serif' }}>S</div>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>SecretaryAI</span>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '28px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--border)',
              color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '600', transition: 'all 0.3s',
            }}>{step > i + 1 ? '✓' : i + 1}</div>
            <span style={{ fontSize: '12px', color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? '500' : '400' }}>{s}</span>
            {i < steps.length - 1 && <div style={{ width: '24px', height: '1px', background: 'var(--border)', margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {/* Step 2 — Connect Gmail */}
      {step === 2 && (
        <div style={card}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Connect your Gmail</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>SecretaryAI needs access to your Gmail to read incoming emails and create calendar events on your behalf. Your data is never shared.</p>

          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Permissions requested:</div>
            {['Read your emails (to extract tasks)', 'Manage your calendar (to create events)', 'Send emails on your behalf (completion notifications)'].map(p => (
              <div key={p} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>

          <button onClick={connectGmail} style={{ ...btn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {/* Google SVG Path... */}
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Connect with Google
          </button>

          <button onClick={() => setStep(3)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', marginTop: '12px', width: '100%', fontFamily: 'DM Sans, sans-serif' }}>
            Skip for now (connect later in Settings)
          </button>
        </div>
      )}

      {/* Step 3 — Set Hours */}
      {step === 3 && (
        <div style={card}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Your working hours</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>AI will only schedule tasks within these hours.</p>

          {gmailConnected && (
            <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--green)' }}>
              ✓ Gmail connected successfully
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {DAYS.map(({ l, v }) => (
              <button key={v} onClick={() => toggleDay(v)} style={{
                width: '38px', height: '38px', borderRadius: '8px',
                border: activeDays.includes(v) ? '2px solid var(--gold)' : '1px solid var(--border)',
                background: activeDays.includes(v) ? 'var(--gold)' : 'transparent',
                color: activeDays.includes(v) ? '#fff' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[{ label: 'Start Hour', key: 'work_start_hour' }, { label: 'End Hour', key: 'work_end_hour' }].map(({ label, key }) => (
              <div key={key}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                <input type="number" min="0" max="23" value={hoursForm[key]} onChange={e => setHoursForm({ ...hoursForm, [key]: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'DM Mono, monospace', outline: 'none' }} />
              </div>
            ))}
          </div>

          <button onClick={saveAndFinish} disabled={saving} style={{ ...btn, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Go to Dashboard →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;