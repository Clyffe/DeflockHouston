import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContactCommissionersComponent } from '../../contact/contact-commissioners.component';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-5 py-20">
      <h1 class="text-section font-bold">
        Contact Commissioners{{ neighborhood() ? ' — ' + neighborhood() : '' }}
      </h1>
      <p class="measure mt-4 leading-relaxed text-ink-700">
      </p>
      <p class="measure mt-4 text-sm text-ink-500">
        <app-contact-commissioners />
      </p>
    </section>
  `,
  imports: [ContactCommissionersComponent],
})
export class Contact {
  private readonly route = inject(ActivatedRoute);

  protected readonly neighborhood = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('neighborhood'))),
    { initialValue: null },
  );
}
