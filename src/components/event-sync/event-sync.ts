import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataSetsProvider} from "../../providers/data-sets/data-sets";
import {AlertController, NavController} from "ionic-angular";
import {UserProvider} from "../../providers/user/user";
import {DataValuesProvider} from "../../providers/data-values/data-values";
import {SyncProvider} from "../../providers/sync/sync";
import {error} from "util";
import {AppProvider} from "../../providers/app/app";

/**
 * Generated class for the DataSetSyncComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'event-sync',
  templateUrl: 'event-sync.html'
})
export class EventSyncComponent implements OnInit{

  @Input() eventSyncObjects;
  @Input() hasDataPrepared;
  @Input() dataSetIds;
  @Input() syncStatus;
  @Input() isDataSetDataDeletionOnProgress;
  @Input() syncProcess;

  @Output() onDeleteDataSetData = new EventEmitter();
  @Output() onSyncDataSetData = new EventEmitter();


  displayName: any;
  currentUser: any;


  constructor(public dataSetsProvider: DataSetsProvider, public alertCtrl: AlertController, public user: UserProvider,
              public navCtrl: NavController,public syncProvider: SyncProvider, public appProvider: AppProvider) {

  }

  ngOnInit(){

      this.user.getCurrentUser().then((user)=>{
        this.currentUser = user;

        if(this.dataSetIds && this.dataSetIds.length > 0){
          //this.loadDataSetsByIds(this.dataSetIds,this.currentUser);
        }else{
        }
      });
  }

  // loadDataSetsByIds(dataSetIds,currentUser){
  //   this.dataSetsProvider.getDataSetsByIds(dataSetIds,currentUser).then((dataSets : any)=>{
  //     dataSets.forEach((dataSet :any)=>{
  //       this.eventSyncObjects[dataSet.id].name = dataSet.name;
  //     });
  //
  //   },error=>{
  //
  //   })
  // }



  dataSetDataDeleteConfirmation(eventProgram,eventId){
    let alert = this.alertCtrl.create({
      title: 'Clear Data Confirmation',
      message: 'Are you want to clear all data on '+ eventProgram +' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Clear',
          handler: () => {
            this.deleteDataSetData(eventProgram,eventId);
          }
        }
      ]
    });
    alert.present();
  }

  deleteDataSetData(eventProgram,eventId){
    this.onDeleteDataSetData.emit({eventId : eventId, eventProgram:eventProgram});

  }

  viewMoreDetailsOnEntryForm(eventId){
    this.navCtrl.push('DataElementSyncPage',{
      syncStatus : this.syncStatus,
      event: this.eventSyncObjects[eventId],
      eventId:eventId,
      itsEvent: true,
      entryFormName : this.eventSyncObjects[eventId].name,
      dataValues : this.eventSyncObjects[eventId].dataValues
    })
  }


  syncSelectedDataSetData(selectedDataSet,eventProgram,eventId){
    this.onSyncDataSetData.emit({dataValues: selectedDataSet,eventId : eventId , eventProgram:eventProgram});

  }


}
