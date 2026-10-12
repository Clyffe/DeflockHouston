import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqEntry } from './faq.model';

@Component({
  selector: 'app-faq-accordion',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq-accordion.html',
})
export class FaqAccordion {
  readonly entries = input.required<FaqEntry[]>();

  /** Allow several panels open at once; readers compare answers. */
  private readonly openIds = signal<ReadonlySet<string>>(new Set<string>());

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  protected toggle(id: string): void {
    this.openIds.update((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }

  protected expandAll(): void {
    this.openIds.set(new Set(this.entries().map((entry) => entry.id)));
  }

  protected collapseAll(): void {
    this.openIds.set(new Set<string>());
  }

  protected isInternal(href: string): boolean {
    return href.startsWith('/');
  }

  protected get allOpen(): boolean {
    return this.openIds().size === this.entries().length;
  }
}
