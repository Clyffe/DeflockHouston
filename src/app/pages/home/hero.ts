import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative isolate overflow-hidden bg-civic-900">
      <img
        src="assets/hero-alpr-camera.jpg"
        alt="A Flock Safety automated license plate reader camera mounted on a pole above a
          parking lot, angled toward passing traffic."
        class="absolute inset-0 -z-10 size-full object-cover"
        fetchpriority="high"
      />
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-r from-civic-900/95 via-civic-900/85 to-civic-900/55"
      ></div>

      <div class="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <h1 class="mt-6 max-w-3xl text-hero font-extrabold leading-[0.95] text-white">
          Houston, we have a privacy problem.
        </h1>
        <p class="measure mt-6 text-lg leading-relaxed text-civic-100">
          Our city has deployed thousands of automated license plate reader (ALPR) cameras, which
          capture and store the movements of every vehicle in their field of view. Learn how we can take our city back from mass surveillance and protect our privacy.
        
        </p>

        <div class="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#map"
            class="bg-signal-400 px-6 py-3 font-semibold text-ink-900 transition-colors hover:bg-signal-300"
            >Camera Map</a
          >
          <a
            href="#faq"
            class="border border-civic-300 px-6 py-3 font-semibold text-white transition-colors hover:border-white"
            >FAQ</a
          >
        </div>
      </div>

      <p class="absolute bottom-3 right-4 text-[11px] leading-tight text-civic-100/70">
        Photo by
        <a
          class="underline"
          href="https://www.flickr.com/photos/diversey/53833285849"
          rel="noopener"
          target="_blank"
          >Tony Webster</a
        >,
        <a
          class="underline"
          href="https://creativecommons.org/licenses/by/2.0/"
          rel="license noopener"
          target="_blank"
          >CC BY 2.0</a
        >.
      </p>
    </section>
  `,
})
export class Hero {}
