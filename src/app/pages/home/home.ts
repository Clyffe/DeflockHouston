import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from './hero';
import { FaqAccordion } from '../../faq/faq-accordion';
import { FAQ_ENTRIES } from '../../faq/faq.data';
import { AlprMapComponent } from '../../map/alpr-map.component';

interface Stage {
  title: string;
  body: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [Hero, FaqAccordion, RouterLink, AlprMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  protected readonly faqEntries = FAQ_ENTRIES;

  protected readonly stages: Stage[] = [
    {
      title: 'The camera reads',
      body: 'A fixed or pole-mounted unit photographs each passing vehicle, extracts the plate characters, and records make, body type, color, and distinguishing damage.',
    },
    {
      title: 'The read is stored',
      body: 'Plate, image, camera location, and timestamp are written to a vendor-hosted database. Storage is rolling, but anything exported into a case file leaves that retention window behind.',
    },
    {
      title: 'Anyone on the network searches it',
      body: 'A single query can reach camera networks owned by thousands of other agencies. The officer types a free-text reason, and nothing in the system checks it.',
    },
  ];

  // TODO: replace with values served from the audit database once the ETL lands.
  protected readonly stats: Stat[] = [
    { value: '2,980', label: 'searches in the most recent audit export' },
    { value: '—', label: 'cameras identified across Houston agencies' },
    { value: '—', label: 'agencies with an active ALPR contract' },
  ];
}
