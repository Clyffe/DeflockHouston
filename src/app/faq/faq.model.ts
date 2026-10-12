export interface FaqLink {
  label: string;
  href: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  /** Each string renders as its own paragraph. */
  answer: string[];
  bullets?: string[];
  links?: FaqLink[];
  /** Shown under the answer so every claim points back at a record. */
  source?: string;
}
