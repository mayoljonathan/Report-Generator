import { Component } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';

import { Admin } from './shared/classes';
import { AuthService, TokenService } from './shared/services/';

import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private tokenService: TokenService,
  ){
  }

  ngOnInit(){
    // Watch for authentication changed in firebase
    this.afAuth.auth.onAuthStateChanged(admin=>{
      this.tokenService.isLoggedIn = admin ? true : false;
      if(admin){
        this.authService._getAdminData(admin.uid)
          .takeWhile(()=> this.tokenService.isLoggedIn) //subscribe/listen realtime until there is a admin logged in, otherwise dont listen anymore
          .subscribe((adminData : Admin)=>{
            this.tokenService.admin = adminData;
        });
      }

    });
  }
}
