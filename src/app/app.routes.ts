import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Deflock Houston | Houston ALPR Watch',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Search activity | Deflock Houston',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact | Deflock Houston',
  },
  {
    // Placeholder for per-neighborhood dashboards backed by the audit database.
    path: 'dashboard/:neighborhood',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Neighborhood Dashboard | Deflock Houston',
  },
  { path: '**', redirectTo: '' },
];
