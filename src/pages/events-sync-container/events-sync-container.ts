import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavParams, NavController, IonicPage} from 'ionic-angular';
import {UserProvider} from "../../providers/user/user";
import {DataValuesProvider} from "../../providers/data-values/data-values";
import {SyncProvider} from "../../providers/sync/sync";
import {AppProvider} from "../../providers/app/app";
import {EventsProvider} from "../../providers/events/events";

/*
  Generated class for the DataSetSyncContainer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'events-sync-container',
  templateUrl: 'events-sync-container.html'
})
export class EventsSyncContainerPage  implements OnInit{



  public loading : boolean = true;
  public loadingMessages : string = "";
  public hasDataPrepared : boolean = false;
  public eventSyncObjects : any = {};
  public isDataSetDataDeletionOnProgress : any = {};
  public syncProcess : any = {};
  public dataSetIds : any = [];
  public syncStatus : string = "";
  public headerLabel : string;
  public currentUser : any;
  idArray: any = {};
  dataSetIdList: any = [];
  valueHolder:any;
  dataValuesStorage : any = { online : 0,offline : 0};


  constructor(public navParams: NavParams,
              public user : UserProvider,
              public navCtrl: NavController, public eventsProvider:EventsProvider,
              public dataValuesProvider : DataValuesProvider, public syncProvider: SyncProvider,
              public appProvider: AppProvider) {}

  ngOnInit() {
    this.user.getCurrentUser().then(user=>{
      this.currentUser = user;
      this.initiateData();
    });
  }

  initiateData(){
    this.headerLabel = "List of ";
    this.headerLabel += (this.navParams.get("syncStatus") == "synced")? "synced": "un synced ";
    this.headerLabel += " events";
    this.syncStatus = (this.navParams.get("syncStatus") == "synced")? "Synced" : "Not synced";


    // this.valueHolder = this.navParams.get("events");
    this.navParams.get("events").forEach((event : any)=>{

      this.loadingMessages = "Grouping data by entry form";
      this.isDataSetDataDeletionOnProgress[event.event] = false;
      this.syncProcess[event.event] = false;
      if(!this.eventSyncObjects[event.event]){
        this.dataSetIds.push(event.event);

        this.eventSyncObjects[event.event] = {
          id :event.event,
          name:event.programName,
          orgUnitName:event.orgUnitName,
          dataValues:event.dataValues,
          status:event.status
        };
      }
    });
    this.loading = false;
  }

  onDeleteDataSetData(event){
    this.loadingMessages = "Clear all data on " + event.eventProgram;
    this.isDataSetDataDeletionOnProgress[event.eventId] = true;
    let dataValueIds = [];
        dataValueIds.push(event.eventId);

    if(dataValueIds.length > 0){
      this.eventsProvider.deleteEventsByIds(dataValueIds,this.currentUser).then(()=>{
        setTimeout(()=>{
          delete this.eventSyncObjects[event.eventId];

          if(this.eventSyncObjects && Object.keys(this.eventSyncObjects).length > 0){
            this.isDataSetDataDeletionOnProgress[event.eventId] = false;

          }else{
            this.navCtrl.pop();
          }
        },500);
      },error=>{});
    }
  }

  onSyncingDataSetData(event){

    this.appProvider.setNormalNotification("Syncing Events data its under implementation, try again later.")

    // this.syncProcess[event.eventId] = true;
    //   this.syncProvider.prepareDataForUploading(event.dataValues).then((preparedData: any)=>{
    //     this.syncProvider.uploadingData(preparedData,event.dataValues, this.currentUser).then((response:any)=>{
    //       this.syncProcess[event.eventId] = true;
    //       let dataValueIds = [];
    //       for(let dataValue of this.eventSyncObjects[event.eventId].dataValues){
    //         if(dataValue && dataValue.id){
    //           dataValueIds.push(dataValue.id);
    //         }
    //       }
    //       if(dataValueIds.length > 0){
    //           delete this.eventSyncObjects[event.eventId];
    //           if(this.eventSyncObjects && Object.keys(this.eventSyncObjects).length > 0){
    //             this.syncProcess[event.eventId] = false;
    //           }else{
    //             this.navCtrl.pop();
    //           }
    //       }
    //     },error=>{
    //       this.appProvider.setNormalNotification("Data Values synchronization failed")
    //       this.syncProcess[event.dataSetId] = false;
    //     })
    //   }, error=>{
    //     this.appProvider.setNormalNotification("Data Values preparation failed")
    //     this.syncProcess[event.dataSetId] = false;
    //   });
    //


  }



}
