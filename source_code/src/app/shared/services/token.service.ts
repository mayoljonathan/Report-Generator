import { Injectable } from '@angular/core';

import { Admin } from '../classes/';

@Injectable()
export class TokenService {

    isLoggedIn: boolean = false;
	admin: Admin; //cache user details
}