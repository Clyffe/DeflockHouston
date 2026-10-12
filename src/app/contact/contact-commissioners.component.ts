import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  APPEARANCE_FORM_URL,
  COURT_MEMBERS,
  DEFAULT_STATEMENT,
  DEFAULT_SUBJECT,
  MAILTO_SAFE_LENGTH,
  ZIP_PATTERN,
  buildSignedBody,
  gmailUrl,
  mailtoUrl,
  outlookUrl,
} from './commissioners.data';

type SendMethod = 'mail-app' | 'gmail' | 'outlook';

@Component({
  selector: 'app-contact-commissioners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <form class="space-y-8" novalidate (submit)="$event.preventDefault()">
      <!-- Recipients -->
      <fieldset>
        <legend class="text-lg font-semibold">Send to</legend>
        <p class="mt-1 text-sm text-ink-700">The whole Court is selected. Uncheck anyone you do not want to include.</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          @for (m of members; track m.id) {
            <label
              class="flex cursor-pointer items-start gap-3 rounded-lg border border-[#384D9C]/25 bg-white p-3 hover:border-[#384D9C]"
            >
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 accent-[#384D9C]"
                [checked]="selected().has(m.id)"
                (change)="toggle(m.id)"
              />
              <span>
                <span class="block font-medium">{{ m.name }}</span>
                <span class="block text-sm text-ink-700">{{ m.office }}</span>
              </span>
            </label>
          }
        </div>
        @if (showErrors() && selected().size === 0) {
          <p class="mt-2 text-sm text-red-700">Select at least one recipient.</p>
        }
      </fieldset>

      <!-- Sender -->
      <fieldset class="grid gap-4 sm:grid-cols-3">
        <legend class="mb-2 text-lg font-semibold sm:col-span-3">Your information</legend>

        <label class="block sm:col-span-1">
          <span class="text-sm font-medium">Full name <span class="text-red-700">*</span></span>
          <input
            type="text"
            autocomplete="name"
            class="mt-1 w-full rounded-md border border-ink-700/30 px-3 py-2"
            [value]="name()"
            (input)="name.set(val($event))"
            [attr.aria-invalid]="showErrors() && !nameValid()"
          />
          @if (showErrors() && !nameValid()) {
            <span class="mt-1 block text-sm text-red-700">Enter your name.</span>
          }
        </label>

        <label class="block">
          <span class="text-sm font-medium">ZIP code</span>
          <input
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            maxlength="10"
            class="mt-1 w-full rounded-md border border-ink-700/30 px-3 py-2"
            [value]="zip()"
            (input)="zip.set(val($event))"
            [attr.aria-invalid]="showErrors() && !zipValid()"
          />
          @if (showErrors() && !zipValid()) {
            <span class="mt-1 block text-sm text-red-700">Use a 5-digit ZIP code.</span>
          }
        </label>
      </fieldset>

      <!-- Message -->
      <fieldset class="space-y-4">
        <legend class="text-lg font-semibold">Your message</legend>

        <label class="block">
          <span class="text-sm font-medium">Subject</span>
          <input
            type="text"
            class="mt-1 w-full rounded-md border border-ink-700/30 px-3 py-2"
            [value]="subject()"
            (input)="subject.set(val($event))"
          />
        </label>

        <label class="block">
          <span class="flex items-center justify-between text-sm font-medium">
            <span>Statement <span class="text-red-700">*</span></span>
            <button type="button" class="text-[#384D9C] underline-offset-2 hover:underline" (click)="resetStatement()">
              Restore original text
            </button>
          </span>
          <textarea
            rows="18"
            class="mt-1 w-full rounded-md border border-ink-700/30 px-3 py-2 leading-relaxed"
            [value]="statement()"
            (input)="statement.set(val($event))"
            [attr.aria-invalid]="showErrors() && !statementValid()"
          ></textarea>
          @if (showErrors() && !statementValid()) {
            <span class="mt-1 block text-sm text-red-700">The statement is too short.</span>
          }
        </label>
        <p class="text-sm text-ink-700">
          Edit freely, and make it personal.
        </p>
      </fieldset>

      <!-- Send -->
      <div class="rounded-xl bg-paper-100 p-5">
        <p class="font-semibold">Send from your own email</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="bg-civic-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-civic-900"
            (click)="send('mail-app')"
          >
            Open in email app
          </button>
          <button
            type="button"
            class="border border-civic-700 px-5 py-2.5 font-semibold text-civic-700 hover:bg-civic-700 hover:text-white"
            (click)="send('gmail')"
          >
            Gmail
          </button>
          <button
            type="button"
            class="border border-civic-700 px-5 py-2.5 font-semibold text-civic-700 hover:bg-civic-700 hover:text-white"
            (click)="send('outlook')"
          >
            Outlook.com
          </button>
          <button type="button" class="px-3 py-2.5 font-semibold text-civic-700 hover:underline" (click)="copy()">
            Copy message
          </button>
        </div>
        @if (notice()) {
          <p class="mt-3 text-sm font-medium text-ink-900" role="status">{{ notice() }}</p>
        }
      </div>
    </form>

    <!-- Other ways to be heard -->
    <section class="mt-12 grid gap-8 sm:grid-cols-2">
      <div>
        <h3 class="text-lg font-semibold">Call their offices</h3>
        <ul class="mt-3 space-y-2 text-sm">
          @for (m of members; track m.id) {
            <li>
              <span class="font-medium">{{ m.name }}</span>
              <span class="text-ink-700"> &middot; {{ m.office }} &middot; </span>
              <a class="text-[#384D9C] hover:underline" [href]="'tel:' + digits(m.phone)">{{ m.phone }}</a>
            </li>
          }
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold">Speak at Commissioners Court</h3>
        <p class="mt-3 text-sm text-ink-700">
          Anyone attending in person at 1001 Preston can sign up to speak for one minute. Submit the appearance
          request at least one hour before the meeting begins.
        </p>
        <a
          class="mt-3 inline-block font-semibold text-[#384D9C] hover:underline"
          [href]="appearanceFormUrl"
          target="_blank"
          rel="noopener"
          >Appearance request form &rarr;</a
        >
      </div>
    </section>
  `,
})
export class ContactCommissionersComponent {
  protected readonly members = COURT_MEMBERS;
  protected readonly appearanceFormUrl = APPEARANCE_FORM_URL;

  protected readonly selected = signal<ReadonlySet<string>>(new Set(COURT_MEMBERS.map((m) => m.id)));
  protected readonly name = signal('');
  protected readonly zip = signal('');
  protected readonly neighborhood = signal('');
  protected readonly subject = signal(DEFAULT_SUBJECT);
  protected readonly statement = signal(DEFAULT_STATEMENT);

  protected readonly showErrors = signal(false);
  protected readonly notice = signal('');

  protected readonly nameValid = computed(() => this.name().trim().length >= 2);
  protected readonly zipValid = computed(() => !this.zip().trim() || ZIP_PATTERN.test(this.zip().trim()));
  protected readonly statementValid = computed(() => this.statement().trim().length >= 50);
  protected readonly formValid = computed(
    () => this.nameValid() && this.zipValid() && this.statementValid() && this.selected().size > 0,
  );

  protected readonly recipients = computed(() =>
    COURT_MEMBERS.filter((m) => this.selected().has(m.id)).map((m) => m.email),
  );

  protected readonly body = computed(() =>
    buildSignedBody(this.statement(), { name: this.name(), zip: this.zip(), neighborhood: this.neighborhood() }),
  );

  protected val(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected digits(phone: string): string {
    return '+1' + phone.replace(/\D/g, '');
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  protected resetStatement(): void {
    this.statement.set(DEFAULT_STATEMENT);
    this.subject.set(DEFAULT_SUBJECT);
  }

  protected async send(method: SendMethod): Promise<void> {
    if (!this.validate()) return;
    const to = this.recipients();
    const subject = this.subject().trim() || DEFAULT_SUBJECT;
    const body = this.body();

    if (method === 'gmail') {
      window.open(gmailUrl(to, subject, body), '_blank', 'noopener');
      this.notice.set('Gmail opened in a new tab. Review the message and press Send.');
      return;
    }
    if (method === 'outlook') {
      window.open(outlookUrl(to, subject, body), '_blank', 'noopener');
      this.notice.set('Outlook opened in a new tab. Review the message and press Send.');
      return;
    }

    const full = mailtoUrl(to, subject, body);
    if (full.length <= MAILTO_SAFE_LENGTH) {
      window.location.href = full;
      this.notice.set('Your email app should open with the message ready. Review it and press Send.');
      return;
    }

    // Too long for many desktop mail clients: send recipients + subject, put the body on the clipboard.
    const copied = await this.writeClipboard(body);
    window.location.href = mailtoUrl(to, subject);
    this.notice.set(
      copied
        ? 'Your message is long, so it was copied to your clipboard. Paste it into the body of the email that just opened.'
        : 'Your message is too long to pre-fill. Use "Copy message", then paste it into the email that just opened.',
    );
  }

  protected async copy(): Promise<void> {
    if (!this.validate()) return;
    const text = `To: ${this.recipients().join(', ')}\nSubject: ${this.subject().trim() || DEFAULT_SUBJECT}\n\n${this.body()}`;
    const ok = await this.writeClipboard(text);
    this.notice.set(ok ? 'Recipients, subject, and message copied.' : 'Copy failed. Select the text manually.');
  }

  private validate(): boolean {
    this.showErrors.set(true);
    if (!this.formValid()) {
      this.notice.set('Fix the highlighted fields first.');
      return false;
    }
    this.notice.set('');
    return true;
  }

  private async writeClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
