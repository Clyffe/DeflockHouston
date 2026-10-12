import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-ink-900 text-civic-100">
      <div class="mx-auto max-w-6xl px-5 py-12">
        <p class="font-display text-2xl font-extrabold text-white">DeFlock Houston</p>
        <p class="measure mt-3 text-sm leading-relaxed text-civic-300">
          Everything published here comes from public records requests, vendor audit exports, and
          city contract documents. Deflock Houston is a volunteer project, not affiliated with any government agency. The site is maintained by volunteers, no political parties or candidiates. No GenAI was used in the creation of this site, and no data was used to train any AI models.
        </p>
        <p class="mt-8 text-xs text-civic-300">
          Contact:
          <a class="underline" href="mailto:mirrorclyffe@protonmail.com">mirrorclyffe&#64;protonmail.com</a>
          &nbsp;&nbsp;Records and methodology available on request.
        </p>
        <ul class="mt-2 flex flex-wrap gap-4 text-xs text-civic-300">
          <li>
            <p>National resources: </p>
          <li>
          <a class="underline" href="https://www.eff.org/" target="_blank" rel="noopener noreferrer">Electronic Frontier Foundation</a>
          </li>
          <li><a class="underline" href="https://www.deflock.org/" target="_blank" rel="noopener noreferrer">Deflock.org</a>
          </li>
          <li> <a class="underline" href="https://www.haveibeenflocked.com/" target="_blank" rel="noopener noreferrer">HaveIBeenFlocked.com</a>
          </li>
        </ul>

      </div>
    </footer>
  `,
})
export class SiteFooter {}
