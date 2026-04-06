import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Billing = () => {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/subscriptions/').then(r => { setSub(r.data); setLoading(false); }).catch(() => setLoading(false));
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setTimeout(() => api.get('/subscriptions/').then(r => setSub(r.data)), 2000);
    }
  }, []);

  const checkout = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const res = await api.post(`/subscriptions/checkout/${plan}`);
      window.location.href = res.data.checkout_url;
    } catch { setCheckoutLoading(''); }
  };

  const openPortal = async () => {
    try {
      const res = await api.post('/subscriptions/portal');
      window.location.href = res.data.portal_url;
    } catch (e) { alert('No billing portal available yet.'); }
  };

  const daysLeft = sub?.trial_end ? Math.max(0, Math.ceil((new Date(sub.trial_end) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const isTrialExpired = sub?.status === 'expired';
  const isPaid = sub?.status === 'active' && sub?.plan !== 'trial';

  const card = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Billing & Subscription</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage your plan and payment details</p>
        </div>

        {/* Success banner */}
        {new URLSearchParams(window.location.search).get('success') && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: 'var(--green)', fontWeight: '500' }}>
            ✓ Payment successful! Your subscription is now active.
          </div>
        )}

        {/* Current plan */}
        {!loading && sub && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Current Plan</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {sub.plan === 'trial' ? '7-Day Free Trial' : sub.plan}
                </div>
                {sub.plan === 'trial' && !isTrialExpired && (
                  <div style={{ fontSize: '13px', color: daysLeft <= 2 ? 'var(--red)' : 'var(--amber)', marginTop: '4px', fontWeight: '500' }}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                  </div>
                )}
                {isTrialExpired && (
                  <div style={{ fontSize: '13px', color: 'var(--red)', marginTop: '4px', fontWeight: '500' }}>Trial expired — upgrade to continue</div>
                )}
                {isPaid && (
                  <div style={{ fontSize: '13px', color: 'var(--green)', marginTop: '4px', fontWeight: '500' }}>Active — renews automatically</div>
                )}
              </div>
              <span style={{
                background: isPaid ? 'var(--green-dim)' : isTrialExpired ? 'var(--red-dim)' : 'var(--amber-dim)',
                color: isPaid ? 'var(--green)' : isTrialExpired ? 'var(--red)' : 'var(--amber)',
                border: `1px solid ${isPaid ? 'var(--green)' : isTrialExpired ? 'var(--red)' : 'var(--amber)'}`,
                borderRadius: '6px', padding: '4px 10px',
                fontSize: '11px', fontWeight: '600', fontFamily: 'DM Mono, monospace',
              }}>{sub.status.toUpperCase()}</span>
            </div>
            {isPaid && (
              <button onClick={openPortal} style={{ marginTop: '16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Manage billing / Cancel
              </button>
            )}
          </div>
        )}

        {/* Upgrade plans */}
        {!isPaid && (
          <>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '14px' }}>Upgrade your plan</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { plan: 'monthly', name: 'Monthly', price: '₹999', period: '/month', features: ['Unlimited tasks', 'Gmail + Calendar sync', 'Google Meet links', 'Priority support', 'Cancel anytime'] },
                { plan: 'yearly', name: 'Yearly', price: '₹8,999', period: '/year', features: ['Everything in Monthly', 'Save 25% vs monthly', 'Early feature access', 'Dedicated support', 'Usage analytics'], featured: true },
              ].map(({ plan, name, price, period, features, featured }) => (
                <div key={plan} style={{ ...card, border: featured ? `2px solid var(--gold)` : '1px solid var(--border)', position: 'relative' }}>
                  {featured && <div style={{ position: 'absolute', top: '-10px', left: '16px', background: 'var(--gold)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '2px 10px', borderRadius: '10px' }}>BEST VALUE</div>}
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{name}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace' }}>
                    {price}<span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontWeight: '400' }}>{period}</span>
                  </div>
                  <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => checkout(plan)} disabled={checkoutLoading === plan} style={{ background: featured ? 'var(--gold)' : 'var(--bg-primary)', border: `1px solid ${featured ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '8px', padding: '10px', color: featured ? '#fff' : 'var(--text-primary)', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', width: '100%', opacity: checkoutLoading === plan ? 0.7 : 1 }}>
                    {checkoutLoading === plan ? 'Redirecting...' : `Get ${name}`}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;