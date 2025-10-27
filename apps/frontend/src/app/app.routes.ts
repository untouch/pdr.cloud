import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'smiley',
    loadComponent: () => import('./smiley/smiley.component').then(m => m.SmileyComponent)
  }
];
