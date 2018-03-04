import { Injectable } from '@angular/core';

import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable } from 'rxjs/Observable';

// Needed for querying once in realtime database
import 'rxjs/add/operator/take';

// Algolia
import * as algolia from 'algoliasearch';
import * as queryString from 'query-string';

@Injectable()
export class GenerateService {

  algolia = algolia("XGEVJWSCYP", "013e7ff8361fd5806238412d8c1f2bb8", {protocol: 'https:'});

  constructor(
    public afDB: AngularFireDatabase,
  ) { 
  }

  getAlgoliaLogs(type,length=50){
    return this.algolia.getLogs({
        offset: 0, // where to start from, default to 0
        length: length, // how much lines do you want, default to 10
        type: type // which logs do you want, default to no value (all)
    }).then(result=>{
        result = result.logs;
        if(result && result.length > 0){
            let container = [];
            result.forEach(data=>{
                // let d =     queryString.parse(data.url);
                let url = data.url;
                let res = url.startsWith('/1/indexes/applications/query');
                if(res){
                    let parsed = queryString.parse(data.query_params);
                    let timestamp = <any>new Date(data.timestamp);
                    timestamp = timestamp.getTime();
                    let newData = {
                        query: parsed.query,
                        timestamp: timestamp
                    }
                    container.push(newData);
                }
            });
            return container;
        }else{
            return [];
        }
    })
  }

  getAppStatsInDashboard(){
    var highestRatedApps = [];
    var mostViewedApps = [];
    var mostDownloadedApps= [];

    return new Observable(observer=>{
        let appsRef = firebase.database().ref(`applications`);
        appsRef.once('value' ,snapshot=>{
            let apps = snapshot.val();
            for(let uid in apps){
                let app_uid = uid;
                getMostDownloaded(app_uid).subscribe((mostDownloadedApps:any)=>{
                    let overallDownloads = mostDownloadedApps.slice(0);
                    let androidDownloads = mostDownloadedApps.slice(0);
                    let desktopDownloads = mostDownloadedApps.slice(0);
                    let sourceCodeDownloads = mostDownloadedApps.slice(0);

                    overallDownloads = sortToHighestDownload(overallDownloads,'totalDownloads');
                    androidDownloads = sortToHighestDownload(androidDownloads,'android');
                    desktopDownloads = sortToHighestDownload(desktopDownloads,'desktop');
                    sourceCodeDownloads = sortToHighestDownload(sourceCodeDownloads,'source_code');
                    let data = {
                        overall: overallDownloads,
                        android: androidDownloads,
                        desktop: desktopDownloads,
                        source_code: sourceCodeDownloads
                    }
                    observer.next({id: 'most_downloaded', data: data});
                });
                getMostViewedApps(app_uid).subscribe(mostViewedApps=>{
                    mostViewedApps = sortToHighest(mostViewedApps,'viewCount');
                    observer.next({id: 'most_viewed', data:mostViewedApps});
                });
                calculateReviews(app_uid).subscribe(highestRatedApps=>{
                    highestRatedApps = sortToHighest(highestRatedApps,'stars');
                    let data = ObjectToArray(highestRatedApps);
                    observer.next({id: 'ratings_reviews', data: data});
                });
            }
        });

        function ObjectToArray(value){
            let arr = [];
            for (let key in value) {
                value[key]['key']= key;
                arr.push(value[key]);
            }
            return arr;
        }
        function sortToHighest(array,field){
            array.sort((a: any, b: any) => {
                if (a[field] > b[field]){ return -1;}
                else if (a[field] < b[field]){ return 1;}
                return 0;
            });
            return array;
        }
        function sortToHighestDownload(array,field){
            array.sort((a: any, b: any) => {
                if (a['downloadsObj'][field] > b['downloadsObj'][field]){ return -1;}
                else if (a['downloadsObj'][field] < b['downloadsObj'][field]){ return 1;}
                return 0;
            });
            return array;
        }

        function getMostViewedApps(app_uid){
            let appViewsRef = firebase.database().ref(`applications_stats/views/${app_uid}/`);
            return new Observable(observer=>{
                appViewsRef.once('value', snapshot=>{
                    if(snapshot.val()){
                        // mostViewedApps
                        let viewCount = Object.keys(snapshot.val()).length;
                        getAppData(app_uid).subscribe(appData=>{
                            let data = {
                                appData: appData,
                                viewCount: viewCount,
                            };
                            mostViewedApps.push(data);
                            observer.next(mostViewedApps);
                        });
                    }
                });
            });
        }
        function calculateReviews(app_uid){
            return new Observable(observer=>{
                let appReviews = firebase.database().ref(`applications_stats/reviews/${app_uid}`);
                appReviews.once('value', snapshot=>{
                    let reviews = snapshot.val();
                    reviews = ObjectToArray(reviews);
                
                    if(reviews && reviews.length > 0){
                        let stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        let averageStarRating = 0;
                        let overallRating = 0;
                        let totalReviews = 0;
                        // Tally for each review star to the stars object
                        reviews.forEach((review)=>{ stars[review.stars]++; });
                        for(let i=1;i<=5;i++){
                            overallRating += i * stars[i];
                            totalReviews += stars[i];
                        }
                        averageStarRating = overallRating / totalReviews;

                        getAppData(app_uid).subscribe(appData=>{
                            let data = {
                                appData: appData,
                                totalReviews: totalReviews,
                                stars: averageStarRating,
                            };
                            // observer.next(data);
                            highestRatedApps.push(data);
                            observer.next(highestRatedApps);
                        });
                    }
                });
            });
        }
        function getMostDownloaded(app_uid){
            return new Observable(observer=>{
                let types = ['source_code','desktop','android'];
                let downloadsObj = {
                    totalDownloads: 0,
                    source_code: 0,
                    desktop: 0,
                    android: 0,
                };
                for(let i=0;i<types.length;i++){
                    let appDownloadsRef = firebase.database().ref(`applications_stats/downloads/${types[i]}/${app_uid}`);
                    appDownloadsRef.on('value', snapshot=>{
                        if(types[i] == 'android'){
                            if(snapshot.val()){
                                let releases = Object.keys(snapshot.val());
                                if(releases && releases.length > 0){
                                    downloadsObj[types[i]] = 0;
                                    for(let x=0;x< releases.length;x++){
                                        downloadsObj[types[i]] += Object.keys(snapshot.val()[releases[x]]).length;
                                    }
                                }
                            }
                        }else{
                            downloadsObj[types[i]] = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
                        }
                        downloadsObj.totalDownloads = downloadsObj.android + downloadsObj.desktop + downloadsObj.source_code; 
                    });
                }
                setTimeout(()=>{
                    getAppData(app_uid).subscribe(appData=>{
                        let data = {
                            appData: appData,
                            downloadsObj: downloadsObj,
                        };
                        if(data.downloadsObj.totalDownloads > 0){
                            mostDownloadedApps.push(data);
                            observer.next(mostDownloadedApps);
                        }
                    });
                },1000);
            });


        }
        function getAppData(app_uid){
            return new Observable(observer=>{
                let appDataRef = firebase.database().ref(`applications/${app_uid}`);
                appDataRef.once('value', snapshot=>{
                    let data = {
                        uid: snapshot.val().uid,
                        title: snapshot.val().title,
                        thumbIconURL: snapshot.val().thumbIconURL,
                        iconURL: snapshot.val().iconURL
                    }
                    observer.next(data);
                });
                
            });
        }
        
        });
        
    }
  

  
}
