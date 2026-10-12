import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuditDashboardComponent } from '../../dashboards/audit-dashboard.component';
/**
 * Placeholder shell for the audit dashboard.
 * Replace the body with the chart components once the audit tables and
 * stored procedures are exposed through the API.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-5 py-20">
      <h1 class="text-section font-bold">
        Dashboard{{ neighborhood() ? ' — ' + neighborhood() : '' }}
      </h1>
      <p class="measure mt-4 leading-relaxed text-ink-700">
      </p>
      <section id="audit" class="scroll-mt-24">
      <app-audit-dashboard />
    </section>
    </section>
  `,  imports: [AuditDashboardComponent],
  
})
export class Dashboard {
  private readonly route = inject(ActivatedRoute);

  protected readonly neighborhood = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('neighborhood'))),
    { initialValue: null },
  );
}
