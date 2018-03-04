import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'toDateAndTime',
})
export class ToDateAndTime implements PipeTransform {

  transform(value: string, ...args) {
    return moment(value).format('lll');
  }
}

