export interface CourtMember {
  id: string;
  office: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  /** true once the address has been confirmed on the office's own website. */
  verified: boolean;
}

/** Harris County Commissioners Court. Confirm addresses before each election cycle. */
export const COURT_MEMBERS: CourtMember[] = [
  {
    id: 'judge',
    office: 'County Judge',
    name: 'Lina Hidalgo',
    email: 'judge.hidalgo@harriscountytx.gov',
    phone: '(713) 274-7000',
    website: 'https://cjo.harriscountytx.gov',
    verified: false,
  },
  {
    id: 'pct1',
    office: 'Commissioner, Precinct 1',
    name: 'Rodney Ellis',
    email: 'Comm_Ellis@cp1.hctx.net',
    phone: '(713) 274-1000',
    website: 'https://hcp1.net',
    verified: false,
  },
  {
    id: 'pct2',
    office: 'Commissioner, Precinct 2',
    name: 'Adrian Garcia',
    email: 'commissioner@pct2.hctx.net',
    phone: '(713) 274-2011',
    website: 'https://www.hcp2.com',
    verified: false,
  },
  {
    id: 'pct3',
    office: 'Commissioner, Precinct 3',
    name: 'Tom S. Ramsey',
    email: 'pct3@pct3.com',
    phone: '(713) 274-3000',
    website: 'https://www.pct3.com',
    verified: false,
  },
  {
    id: 'pct4',
    office: 'Commissioner, Precinct 4',
    name: 'Lesley Briones',
    email: 'service@hcp4.net',
    phone: '(832) 927-4444',
    website: 'https://cp4.harriscountytx.gov',
    verified: true,
  },
];

export const APPEARANCE_FORM_URL = 'https://agenda.harriscountytx.gov/Speak-at-Court/Appearance-Request-Form';

export const DEFAULT_SUBJECT = 'End ALPR surveillance in Harris County';

export const DEFAULT_STATEMENT = `Dear Members of the Harris County Commissioners Court,

As a Harris County resident, I ask the Court to end the county's use of automated license plate readers (ALPRs), including Flock Safety cameras.

Throughout years of deploying these technologies, the systems have been used for mass surveillance, to target constitutionally protected movements and expression. in flagrant violation of HPD's and Flock's use guidelines. Additionally, these technologies have, in Harris County, been used to stalk and harass innocent civilians, with no ties to crime.

A federal court has ruled that warrantless ALPR database searches are unconstitutional, opening the door for lawsuits and appeals from anyone arrested using ALPR technology. Additionally, thanks to sharing networks, law enforcement all over the country can see Houstonian's private data.

In light of this, over 133 cities and municipalities, including Austin, TX, have ended their contract with Flock and other ALPR systems. Houston should set an example for the state and country. 

Houstonians deserve safety, they deserve a law enforcement system that is transparent and accountable. ALPR systems make policing less accountable, and ultimately makes us less safe.

I ask the Court to:
1. Decline to approve or renew any county ALPR contract, including Flock Safety, and wind down existing deployments.
2. Prohibit sharing county ALPR data with outside agencies, including federal agencies.
3. Publish full ALPR search audit logs, including the reason given for each search.
4. Require a public hearing and recorded vote before any new surveillance technology is deployed.

Residents should not have their movements logged as the price of using public roads.`;

export interface Sender {
  name: string;
  zip: string;
  neighborhood: string;
}

export function buildSignedBody(statement: string, sender: Sender): string {
  const name = sender.name.trim();
  const zip = sender.zip.trim();
  const neighborhood = sender.neighborhood.trim();
  const residency = ['Harris County resident', zip ? `ZIP ${zip}` : '']
    .filter(Boolean)
    .join(', ');
  return `${statement.trim()}\n\nSincerely,\n${name}\n${residency}`;
}

const enc = (s: string): string => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));

export function mailtoUrl(to: string[], subject: string, body?: string): string {
  const params = [`subject=${enc(subject)}`];
  if (body !== undefined) params.push(`body=${enc(body)}`);
  return `mailto:${to.join(',')}?${params.join('&')}`;
}

export function gmailUrl(to: string[], subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.join(','))}&su=${enc(subject)}&body=${enc(body)}`;
}

export function outlookUrl(to: string[], subject: string, body: string): string {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to.join(';'))}&subject=${enc(subject)}&body=${enc(body)}`;
}

/** Desktop mail clients (notably Outlook on Windows) truncate or reject mailto URLs past ~2,000 characters. */
export const MAILTO_SAFE_LENGTH = 1900;

export const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
