import { Component, OnInit, ViewChild} from '@angular/core';
import { Router }  from '@angular/router';
import {FormBuilder, FormGroup,FormControl, Validators} from '@angular/forms';

import { AuthService,TokenService,GenerateService } from '../../shared/services';

import { Admin } from '../../shared/classes';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  menuOpen: boolean = true;
  isLoading: boolean = null;

  selectedEntity: number; // 0-users,1-apps
  selectedSpecification: number; //1-yes,search for specific, 0-all

  // configs for *ngIf
  entity = {
    user:{
      specific: null,
      user_uid: null,
      type_of_data: null, // showcased_apps,user_favorites,user_downloads
    },
    app:{
      
    }
  };

  userSelectionControl: FormControl;
  user_name;

  // Temporary
  appStats = {
    ratings_reviews: [],
    most_viewed: [],
    most_downloaded: []
  };

  generatedTitle = '';
  generatedReport = null;
  displayedColumns;
  dataSource = new MatTableDataSource();
  // firstLoad: boolean = true;

  selectedTabIndex = 0;

  searchLogs = [];

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private authService: AuthService,
    private generateService: GenerateService,
    private formBuilder: FormBuilder,
  ) {
    this.userSelectionControl = new FormControl();
  }

  ngOnInit() {
    
  }

  goToAdminPanel(){
    window.open('https://showcase-it-apanel.github.io/www/');
  }

  // Temporary
  generateReport(type,triggerMenu = true){
    this.isLoading = true;
    this.generatedReport = type;
    if (triggerMenu) { this.menuOpen = !this.menuOpen; }

    var getAppStats = ()=>{
      this.generateService.getAppStatsInDashboard().subscribe((res:any)=>{
        this.appStats[res.id] = res.data;
        console.log(this.appStats.most_downloaded);
        displayData();
      });
    }

    var displayData = ()=>{
      this.isLoading = false;
      if(type === 0){
        this.generatedTitle = 'Highest Rated Apps';
        this.displayedColumns = ['No.', 'App UID', 'Title', 'No. of Reviews', 'Stars'];
        this.dataSource = new MatTableDataSource(this.appStats.ratings_reviews);
      }else if(type === 1){
        this.generatedTitle = 'Most Viewed Apps';
        this.displayedColumns = ['No.', 'App UID', 'Title', 'Views'];
        this.dataSource = new MatTableDataSource(this.appStats.most_viewed);
      }else if(type === 2){
        this.generatedTitle = 'Most Downloaded Apps';
        this.displayedColumns = ['No.', 'App UID', 'Title', 'Downloads'];

        if(this.selectedTabIndex === 0){
          this.dataSource = new MatTableDataSource(this.appStats.most_downloaded['overall']);
        }else if(this.selectedTabIndex === 1){
          this.dataSource = new MatTableDataSource(this.appStats.most_downloaded['android']);
        }else if(this.selectedTabIndex === 2){
          this.dataSource = new MatTableDataSource(this.appStats.most_downloaded['desktop']);
        }else if(this.selectedTabIndex === 3){
          this.dataSource = new MatTableDataSource(this.appStats.most_downloaded['source_code']);
        }

      }else if(type === 3){
        this.generatedTitle = 'Latest Search Queries';
        this.displayedColumns = ['No.', 'Query', 'Time'];
        this.dataSource = new MatTableDataSource(this.searchLogs);
      }
      // this.firstLoad = false;
    }
    
    // WHEN A GENERATE HAS CLICKED ONCE, THEN JUST DISPLAY IT NO MORE QUERYING
    if(type === 3){
      this.generateService.getAlgoliaLogs('query').then(data=>{
        this.searchLogs = data;
        console.log(data);
        displayData();
      });
    }else{
      // if(this.firstLoad){
        getAppStats();
        setTimeout(()=>{
          displayData();
        },2000);
        // setTimeout(displayData(),2000)
      // }else{
        // displayData();
      // }
    }


  }

  onTabChange(index){
    this.selectedTabIndex = index;
  }

  refreshReport(){
    this.generateReport(this.generatedReport, false);
  }

  printReport(){
    setTimeout(()=>{
      window.print();
    },1000);

    // NOT WORKING AS INTENDED, TABLE IS NOT STYLED IN PRINT
    // let printContents, popupWin;
    // printContents = document.getElementById('print-section').innerHTML;
    // popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    // popupWin.document.open();
    // popupWin.document.write(`
    //   <html>
    //     <head>
    //       <title>Print Report</title>
    //     </head>
    //     <body onload="window.print();window.close()">${printContents}</body>
    //   </html>`
    // );
    // popupWin.document.close();

    // popupWin.document.write('<html><head><title></title>');
    // popupWin.document.write('<link rel="stylesheet" href="https://unpkg.com/@angular/material/prebuilt-themes/indigo-pink.css" type="text/css" media="print"/>');
    // popupWin.document.write('</head><body>');
    // popupWin.document.write(printContents);
    // popupWin.document.write('</body></html>');
    // popupWin.document.close();
    // popupWin.focus();
    // setTimeout(()=>{window.print();},1000);
    // popupWin.close();
    // return true;
  }

  signOut(){
    this.router.navigate(['/login']);
    this.authService.signOut();
  }
}
