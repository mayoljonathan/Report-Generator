import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

// Import module
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { PipesModule } from './shared/pipes/pipes.module';

import { MaterialModule } from './shared/modules/material.module';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

// Guards
import { AuthGuard } from './auth.guard';

// Import starting entry component
import { AppComponent } from './app.component';

// Import components from pages
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';

// Service Worker
import { ServiceWorkerModule } from '@angular/service-worker';

// Import helpers,services
import { TokenService,AuthService,GenerateService } from './shared/services';

import { UIHelper } from './shared/helpers/';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase), // imports firebase/app needed for everything
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    PipesModule,
  ],
  providers: [
    TokenService,AuthService,GenerateService,
    AuthGuard,
    UIHelper
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
