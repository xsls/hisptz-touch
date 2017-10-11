import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {AboutProvider} from "../../providers/about/about";
import {AppProvider} from "../../providers/app/app";
import {DataValuesProvider} from "../../providers/data-values/data-values";
import {UserProvider} from "../../providers/user/user";
import {EventsProvider} from "../../providers/events/events";

/**
 * Generated class for the AboutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage implements OnInit{

  logoUrl : string;
  currentUser: any;
  appInformation : any;
  systemInfo : any;
  loadingMessage : string;
  isLoading : boolean = true;
  hasAllDataBeenLoaded :boolean = false;
  aboutContents : Array<any>;
  isAboutContentOpen : any = {};
  dataValuesStorage : any = { online : 0,offline : 0};
  eventsDataStorage : any = { online : 0,offline : 0};



  constructor(public navCtrl: NavController,
              private appProvider : AppProvider, private eventsProvider:EventsProvider,
              private aboutProvider : AboutProvider, private dataValuesProvider: DataValuesProvider, private userProvider: UserProvider) {
  }

  ngOnInit() {
    this.loadingMessage = 'Loading app information';
    this.isLoading = true;
    this.logoUrl = 'assets/img/logo.png';
    this.aboutContents = this.aboutProvider.getAboutContentDetails();
    this.userProvider.getCurrentUser().then((currentUser: any) => {
      this.currentUser = currentUser;
      this.loadAllData();
    }, error => {
      this.isLoading = false;
      this.appProvider.setNormalNotification("Fail to load user information");
    })
  }


  loadAllData(){
    this.hasAllDataBeenLoaded = false;
    this.aboutProvider.getAppInformation().then(appInformation => {
      this.appInformation = appInformation;
      this.loadingMessage = 'Loading system information';
      this.aboutProvider.getSystemInformation().then(systemInfo => {
        this.systemInfo = systemInfo;
        if (this.aboutContents.length > 0) {
          if(this.isAboutContentOpen && !this.isAboutContentOpen[this.aboutContents[0].id]){
            this.toggleAboutContents(this.aboutContents[0]);
          }
        }
        this.loadingDataValueStatus();
        this.loadingEventsDataStatus();

        this.isLoading = false;
        this.loadingMessage = '';
      }).catch(error => {
        this.isLoading = false;
        this.loadingMessage = '';
        console.log(JSON.stringify(error));
        this.appProvider.setNormalNotification('Fail to load system information');
      });
    }).catch(error => {
      this.isLoading = false;
      this.loadingMessage = '';
      console.log(JSON.stringify(error));
      this.appProvider.setNormalNotification('Fail to load app information');
    });
  }

  ionViewDidEnter(){
    if(this.hasAllDataBeenLoaded){
      this.loadAllData();
    }
  }

  toggleAboutContents(content){
    if(content && content.id){
      if(this.isAboutContentOpen[content.id]){
        this.isAboutContentOpen[content.id] = false;
      }else{
        Object.keys(this.isAboutContentOpen).forEach(id=>{
          this.isAboutContentOpen[id] = false;
        });
        this.isAboutContentOpen[content.id] = true;
      }
    }
  }


  loadingDataValueStatus(ionRefresher?){
    this.loadingMessage = 'Loading data values storage status';
    this.isLoading = true;
    this.dataValuesProvider.getDataValuesByStatus("synced",this.currentUser).then((syncedDataValues : any)=>{
      this.dataValuesProvider.getDataValuesByStatus("not-synced",this.currentUser).then((unSyncedDataValues : any)=>{
        this.dataValuesStorage.offline = unSyncedDataValues.length;
        this.dataValuesStorage.online = syncedDataValues.length;
        this.dataValuesStorage["synced"] = syncedDataValues;
        this.dataValuesStorage["not-synced"] = unSyncedDataValues;

      },error=>{
        if(ionRefresher){
          ionRefresher.complete();
        }
        this.appProvider.setNormalNotification('Fail to loading data values storage status');
        this.isLoading = false;
      });
    },error=>{
      if(ionRefresher){
        ionRefresher.complete();
      }
      this.appProvider.setNormalNotification('Fail to loading data values storage status');
      this.isLoading = false;
    });
  }

  loadingEventsDataStatus(ionRefresher?){
    this.eventsProvider.getEventsFromStorageByStatus("synced", this.currentUser).then((syncedEventData:any)=>{
    this.eventsProvider.getEventsFromStorageByStatus("not-synced", this.currentUser).then((unsyncedEventData:any)=>{
      this.eventsDataStorage.offline = unsyncedEventData.length;
      this.eventsDataStorage.online = syncedEventData.length;
      this.eventsDataStorage["synced"] = syncedEventData;
      this.eventsDataStorage["not-synced"] = unsyncedEventData;
      //@todo move this when loading all data even events
      this.hasAllDataBeenLoaded = true;

    },error=>{
      if(ionRefresher){
        ionRefresher.complete();
      }
      this.appProvider.setNormalNotification('Failed to load events data from storage');
      this.isLoading = false;
    })
    },error=>{
      if(ionRefresher){
        ionRefresher.complete();
      }
      this.appProvider.setNormalNotification('Fail to load events data from storage');
      this.isLoading = false;
    })

  }


  viewDataValuesSynchronisationStatusByDataSets(syncStatus){
    if(this.dataValuesStorage[syncStatus].length > 0){
      this.navCtrl.push('DataValuesSyncContainerPage',{dataValues : this.dataValuesStorage[syncStatus],syncStatus:syncStatus});
    }else{
      this.appProvider.setNormalNotification("There is nothing to view");
    }
  }

  viewEventDataSynchronisationsStatuses(syncStatus){
    if(this.eventsDataStorage[syncStatus].length > 0){
      //alert("statusData :"+JSON.stringify(this.eventsDataStorage[syncStatus]))
      this.navCtrl.push('EventsSyncContainerPage',{events : this.eventsDataStorage[syncStatus],syncStatus:syncStatus});
    }else{
      this.appProvider.setNormalNotification("There is nothing to view");
    }
  }


}
