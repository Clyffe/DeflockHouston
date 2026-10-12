import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
}

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 bg-civic-700 text-white">
      <div class="mx-auto flex max-w-6xl items-center gap-6 px-5 py-4">
        <a routerLink="/" class="font-display text-lg font-extrabold tracking-tight">
          DEFLOCK HOUSTON
        </a>

        <nav class="ml-auto hidden md:block" aria-label="Primary">
          <ul class="flex items-center gap-7 text-sm font-medium">
            @for (link of links; track link.label) {
              <li>
                <a
                  [routerLink]="link.path"
                  [fragment]="link.fragment"
                  class="border-b-2 border-transparent pb-1 transition-colors hover:border-signal-400"
                  >{{ link.label }}</a
                >
              </li>
            }
            <li>
              <a
                routerLink="/dashboard"
                class="bg-signal-400 px-4 py-2 font-semibold text-ink-900 transition-colors hover:bg-signal-300"
                >Search the audit logs</a
              >
            </li>
          </ul>
        </nav>

        <button
          type="button"
          class="ml-auto md:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-nav"
          (click)="toggleMenu()"
        >
          <span class="sr-only">Menu</span>
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" fill="none">
            @if (menuOpen()) {
              <path d="M6 6l14 14M20 6L6 20" stroke="currentColor" stroke-width="2" />
            } @else {
              <path d="M4 8h18M4 13h18M4 18h18" stroke="currentColor" stroke-width="2" />
            }
          </svg>
        </button>
      </div>

      @if (menuOpen()) {
        <nav id="mobile-nav" class="border-t border-civic-500 md:hidden" aria-label="Primary">
          <ul class="mx-auto max-w-6xl px-5 py-3 text-sm font-medium">
            @for (link of links; track link.label) {
              <li class="border-b border-civic-500/60">
                <a
                  [routerLink]="link.path"
                  [fragment]="link.fragment"
                  class="block py-3"
                  (click)="closeMenu()"
                  >{{ link.label }}</a
                >
              </li>
            }
            <li class="pt-3">
              <a
                routerLink="/dashboard"
                class="block bg-signal-400 px-4 py-3 text-center font-semibold text-ink-900"
                (click)="closeMenu()"
                >Search the audit logs</a
              >
            </li>
          </ul>
        </nav>
      }
    </header>
  `,
})
export class SiteHeader {
  protected readonly menuOpen = signal(false);

  protected readonly links: NavLink[] = [
    { label: 'What is Flock?', path: '/', fragment: 'how-it-works' },
    { label: 'FAQ', path: '/', fragment: 'faq' },
    { label: 'Take action', path: '/', fragment: 'take-action' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
