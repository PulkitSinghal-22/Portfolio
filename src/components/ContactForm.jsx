import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all fields before sending.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    fetch("https://formsubmit.co/ajax/pulkitsinghal622@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `New Portfolio Message from ${name}`
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Could not send email. Please try again later.");
        }
      })
      .then(() => {
        setLoading(false);
        setStatus({
          type: 'success',
          message: `Thank you, ${name}! Your message has been sent successfully. I will get back to you soon.`
        });
        setFormData({ name: '', email: '', message: '' });
      })
      .catch((error) => {
        setLoading(false);
        setStatus({
          type: 'error',
          message: error.message || "An error occurred while sending your message. Please try again."
        });
      });
  };

  return (
    <div className="glass-card">
      <form onSubmit={handleSubmit} className="contact-form-card">
        {status.message && (
          <div className={`form-status ${status.type}`} style={{ display: 'block' }}>
            {status.message}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="form-name" className="form-label">Your Name</label>
          <input
            type="text"
            id="form-name"
            name="name"
            className="form-input"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="form-email" className="form-label">Email Address</label>
          <input
            type="email"
            id="form-email"
            name="email"
            className="form-input"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="form-message" className="form-label">Message</label>
          <textarea
            id="form-message"
            name="message"
            className="form-textarea"
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="form-submit-btn" 
          disabled={loading}
        >
          {loading ? (
            <>
              Sending... <Loader2 className="animate-spin" size={18} />
            </>
          ) : (
            <>
              Send Message <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
