import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material';

@Injectable()
export class UIHelper {

  constructor(
    public snackBar: MatSnackBar
  ) { 
  }

  //action is optional, duration is optional(milliseconds)
  showSnackBar(message: string, duration: number = 3000, action?: string){
    this.snackBar.open(message, action, { duration: duration , horizontalPosition: 'right', verticalPosition: 'top'});
  }
  

}
