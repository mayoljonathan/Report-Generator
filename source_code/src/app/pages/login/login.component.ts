import { Component, OnInit } from '@angular/core';
import { Router }  from '@angular/router';

import * as EmailValidator from 'email-validator';

import { Admin } from '../../shared/classes/';

import { AuthService,TokenService } from '../../shared/services/';
import { UIHelper } from '../../shared/helpers/';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true; 
  errorMessage: string = '';

  isLoading: boolean = false;
  admin: Admin;

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService,
    private UIHelper: UIHelper,
  ) { 
    this.admin = new Admin();
  }

  ngOnInit() {
  }

  signIn(){
    if(!this.admin.email){
      this.UIHelper.showSnackBar('Please input your email address.', 3000);
    }else if(!EmailValidator.validate(this.admin.email)){
      this.UIHelper.showSnackBar('Email address is not valid.', 3000);
    }else if(!this.admin.password){
      this.UIHelper.showSnackBar('Please input your password.', 3000);
    }else{
      this.isLoading = true;
      this.authService.signIn(this.admin).then(res=>{
        // If credentials are correct in authentication
        if(res){
          this.authService.getAdminData(res.uid).then((adminData:Admin)=>{
            // No credentials found in firebase db
            if(!adminData){
              this.authService.signOut();
              return this.UIHelper.showSnackBar('There are no users found in your credentials.', 4000);
            }
            // If credentials found in firebase db
            if(adminData.status === 'disabled'){
              this.UIHelper.showSnackBar('Your account has been disabled by the Super Admin.', 4000);
              this.authService.signOut();
            }else if(adminData.status === 'active'){
              this.tokenService.admin = adminData;
              this.UIHelper.showSnackBar(`Welcome ${adminData.name}!`, 3000);
              this.router.navigate(['/home']);
            }else{
              this.UIHelper.showSnackBar('Unable to sign in this account. Please contact the Super Admin.', 4000);
              this.authService.signOut();
            }
          });
        }
        this.isLoading = false;
      },error=>{
        let msg = error.message;
        if(error['code'] === 'auth/user-not-found'){
          msg = `The credentials you've entered doesn't match any account.`;
        }else if(error['code'] === 'auth/user-disabled'){
          msg = `Your account has been disabled by the Super admin.`;
        }
        this.UIHelper.showSnackBar(msg, 4000);
        this.isLoading = false;
      });
    }
  }

  goToAdminPanel(){
    window.open('https://showcase-it-apanel.github.io/www/');
  }

}
