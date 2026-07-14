import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'timeline', label: 'Education' },
  { id: 'contact', label: 'Contact' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // 1. Sticky Class toggle
      setScrolled(window.scrollY > 50);

      // 2. Scroll Spy Logic
      const sections = ['hero', 'about', 'skills', 'projects', 'timeline', 'contact'];
      let currentSection = 'hero';

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is near or above the navbar height
          if (rect.top <= 100) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial scroll check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <a 
          href="#hero" 
          className="nav-logo" 
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
        >
          Pulkit<span>.S</span>
        </a>

        {/* Desktop Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a 
                href={`#${item.id}`} 
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button 
          className="contact-btn-nav" 
          onClick={() => handleNavClick('contact')}
        >
          Get In Touch
        </button>

        {/* Mobile Toggle Button */}
        <div 
          className={`menu-toggle ${mobileMenuOpen ? 'open' : ''}`} 
          id="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
    </header>
  );
}
