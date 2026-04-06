import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { ...form, role: 'executive' });
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify({ name: form.name, role: 'Executive' }));
      navigate('/onboarding');
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  const inp = { width: '100%', background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display, serif' }}>S</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>SecretaryAI</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Start your free trial</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>7 days free · No credit card required</p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[{ label: 'Full Name', key: 'name', type: 'text', placeholder: 'Arvind Choudhary' }, { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@company.com' }, { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={inp} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
            ))}

            {error && <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' }}>{error}</div>}

            <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'var(--green)' }}>
              ✓ 7-day free trial starts immediately after registration
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{ marginTop: '4px', background: 'var(--gold)', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontWeight: '600', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(157,123,47,0.25)' }}>
              {loading ? 'Creating account...' : 'Create Free Account →'}
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: '600' }}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;