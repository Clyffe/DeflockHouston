import { FaqEntry } from './faq.model';

/**
 */
export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'what-is-alpr',
    question: 'What is an automated license plate reader?',
    answer: [
      'Automated license plate readers (ALPRs) are high speed, computer controlled cameras that automatically read and record license plate information from passing vehicles. They can be mounted on poles, on the front of police cars, or on other vehicles. The cameras are often paired with a flash and infrared light to capture images at night. The images, which can include the vehicle and its occupants, are processed by software that extracts the license plate number and stores it in a database along with the time, date, and location.',
    ],
  },
  {
    id: 'who-runs-them',
    question: 'Who operates these cameras in Houston?',
    answer: [
      'Cameras are run by several separate agencies rather than one: the city police department, university and hospital police forces, transit authorities, and private management districts and HOAs that buy their own cameras and share the feed with law enforcement.',
    ],
  },
  {
    id: 'what-data',
    question: 'What gets collected, and how is it used?',
    answer: [
      'ALPRs collect license plate info, as well as make, model, color, dents, bumper stickers, and other defining marks of a vehicle. This data is then used to create a detailed location history of the vehicle and its occupants, which can be used for law enforcement investigations, surveillance, and other purposes.',
      'With this, law enforcement can trace the daily life of their citizens, including commute, work schedules, who you visit, what doctor you see, and what religious services you attend. The data can be used to build a profile of your habits, associations, and movements over time.',
    ],
  },
  {
    id: 'who-can-search',
    question: 'Who can search the data once it exists?',
    answer: [
      'Any officer with the contracting agency, any affiliated parties the owner shares data with, such as other law enforcement agencies.',
      'Each search records a reason typed by the officer. Those reason fields are often a case number or <a href="https://ij.org/the-ij-database-of-alpr-abuse/" class="text-signal-400 hover:underline">a single word</a>, and nothing in the system verifies them.',
    ],
  },
  {
    id: 'does-it-reduce-crime',
    question: 'Do the cameras reduce crime?',
    answer: [
      'Flock and other vendors say that ALPRs reduce crime, but both independent investigations and internal <a href="https://www.wired.com/story/flock-safety-license-plate-readers-crime/" class="text-signal-400 hover:underline">audits show mixed results.</a>',
    ],
  },
  {
    id: 'misreads',
    question: 'What happens when a plate is misread?',
    answer: [
    ],
  },
  {
    id: 'audit-logs',
    question: 'What is in the audit logs published here?',
    answer: [
    ],
    links: [{ label: 'Open the search activity dashboard', href: '/dashboard' }],
  },
  {
    id: 'take-action',
    question: 'What can Houstonians actually do?',
    answer: ['Houstonians can do a lot to fight back! You can write to your elected officials, talk to your neighbors, attend public meetings, and support organizations that advocate for privacy and civil liberties.'],
    bullets: [
    ],
  },
];
