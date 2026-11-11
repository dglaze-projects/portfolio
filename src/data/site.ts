/**
 * Site-wide configuration.
 * Edit here once — header, footer, and meta tags all read from this.
 */

export const SITE = {
  name: 'Deanna Glaze',
  title: 'Deanna Glaze — Product Design Leader',
  description:
    'Product design leader bringing clarity to complex systems through research, strategy, and team leadership. Work across AI, connected products, health, and publishing.',
  url: 'https://deannaglaze.com',
  author: 'Deanna Glaze',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SOCIAL = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/deannaglaze',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/monkeyshineme/',
  },
] as const;

/** Where "Let's chat" CTAs point — the on-site contact form
    (POSTs to /api/contact, delivered by Resend). */
export const CONTACT_URL = '/contact';
