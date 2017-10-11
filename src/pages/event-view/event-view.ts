import { Component,OnInit } from '@angular/core';
import {NavController, ToastController, NavParams, IonicPage} from 'ionic-angular';
import {EventsProvider} from "../../providers/events/events";
import {ProgramsProvider} from "../../providers/programs/programs";
import {UserProvider} from "../../providers/user/user";
import {AppProvider} from "../../providers/app/app";
import {OrganisationUnitsProvider} from "../../providers/organisation-units/organisation-units";
import {DataElementsProvider} from "../../providers/data-elements/data-elements";



/*
 Generated class for the EventView page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html',

})
export class EventView implements OnInit{

  public loadingData : boolean = false;
  public loadingMessages : any = [];
  public currentUser : any;
  public params : any;

  currentProgram : any;
  currentOrgUnit : any;
  public event : any;
  public dataElementMapper : any;

  constructor(public NavParams:NavParams,public eventProvider :EventsProvider,public Program : ProgramsProvider,
              public orgUnitProvider:OrganisationUnitsProvider, public toastCtrl: ToastController,public user : UserProvider,public appProvider:AppProvider,
              public programsProvider: ProgramsProvider, public navCtrl: NavController, public dataElementProvider:DataElementsProvider){


  }

  ngOnInit() {
    this.user.getCurrentUser().then(user=>{
      this.currentUser = user;
      this.currentProgram = this.programsProvider.lastSelectedProgram;
      this.currentOrgUnit = this.orgUnitProvider.lastSelectedOrgUnit;
      this.params = this.NavParams.get("params");
      this.loadProgramMetadata();
    });


  }

  ionViewDidEnter(){
    if(this.params && this.params.programId){
      this.loadProgramMetadata();
    }
  }

  /**
   *
   * @param programId
     */
  loadProgramMetadata(){
    this.loadingData = true;
    this.loadingMessages = [];
    this.setLoadingMessages("Loading program metadata");
    this.loadProgramStageDataElements();
  }

  /**
   *
   * @param programStageDataElementsIds
     */
  loadProgramStageDataElements(){
   let dataElementIds = [];
    this.dataElementMapper = {};
    this.programsProvider.getProgramsStages(this.currentProgram.id,this.currentUser).then((programsStages:any)=>{


      programsStages.forEach((programsStage:any)=> {
        programsStage.programStageDataElements.forEach((programStageDataElement) => {


          dataElementIds.push(programStageDataElement.dataElement.id);


          this.dataElementProvider.getDataElementsByName(programStageDataElement.dataElement.id, this.currentUser).then((dataElementInfo:any)=>{
            //alert("programStageDataElement is: "+JSON.stringify(dataElementInfo))
            dataElementInfo.forEach((element:any)=>{
              this.dataElementMapper[element.id] = element;
            })

          })


        })

      });

    });
    this.dataElementProvider.getBulkDataElementsByName(dataElementIds,this.currentUser).then((programStageDataElements:any)=>{
       //alert("dataElement.. is: "+JSON.stringify(programStageDataElements))
    // this.programsProvider.getProgramsStages(programStageDataElementsIds,this.currentUser).then((programStageDataElements:any)=>{
      programStageDataElements.forEach((programStageDataElement)=>{
        // this.dataElementMapper[programStageDataElement.dataElement.id] = programStageDataElement.dataElement;
        // this.dataElementMapper[programStageDataElement.id] = programStageDataElement;
         //alert("dataElement is: "+JSON.stringify(programStageDataElement))
      });
      this.loadingEvent(this.params.event);
    },error=>{
      this.loadingData = false;
      this.appProvider.setNormalNotification("Fail. to load entry fields details : " + JSON.stringify(error));
    });
  }

  /**
   *
   * @param programId
   * @param orgUnitId
   * @param eventId
   */
  loadingEvent(eventId){
    this.setLoadingMessages("Loading event");
    let eventTableId = this.currentProgram.id+"-"+this.currentOrgUnit.id+"-"+eventId;
    this.eventProvider.loadingEventByIdFromStorage(eventId,this.currentUser).then((event:any)=>{

      this.event = event;
      this.loadingData = false;
    },error=>{
      this.loadingData = false;
      this.appProvider.setTopNotification("Fail to load event with id : " + eventId);
    });
  }

  setLoadingMessages(message){
    this.loadingMessages.push(message);
  }

  // gotToEditEvent(event){
  //   let params = {
  //     orgUnitId : this.params.orgUnitId,
  //     orgUnitName : this.params.orgUnitName,
  //     programId : this.params.programId,
  //     programName : this.params.programName,
  //     selectedDataDimension : this.params.selectedDataDimension,
  //     event : event.event
  //   };
  //   this.navCtrl.push(EventCaptureForm,{params:params});
  // }



}
