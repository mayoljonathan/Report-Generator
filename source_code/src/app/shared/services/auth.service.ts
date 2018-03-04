import { Injectable } from '@angular/core';

import { Admin } from '../classes';

import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';

// Needed for querying once in realtime database
import 'rxjs/add/operator/take';

@Injectable()
export class AuthService {

  admin: Admin;

  constructor(
    public afAuth: AngularFireAuth,
    public afDB: AngularFireDatabase,
  ) { 
  }

  signIn(credentials: Admin){
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,credentials.password);
  }

  signOut(){
    return this.afAuth.auth.signOut();
  }

  // returns a Promise
  getAdminData(admin_uid){
    return firebase.database().ref(`_admin/${admin_uid}`).once('value').then(snapshot=>{
        return snapshot.val();
    });
  }

  // returns an Observable
  _getAdminData(admin_uid){
    return this.afDB.object(`_admin/${admin_uid}`).valueChanges();
  }

}
