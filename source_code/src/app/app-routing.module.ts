import { NgModule } from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

// Import components from pages
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';

import { AuthGuard } from './auth.guard';

 
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: LoginComponent } //redirect whenever path is not existing 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}