import { Component,OnInit } from '@angular/core';
import {ToastController, NavParams, ActionSheetController, NavController, IonicPage} from 'ionic-angular';
import {EventsProvider} from "../../providers/events/events";
import {ProgramsProvider} from "../../providers/programs/programs";
import {UserProvider} from "../../providers/user/user";
import {ProgramStageSectionsProvider} from "../../providers/program-stage-sections/program-stage-sections";
import {EventCaptureFormProvider} from "../../providers/event-capture-form/event-capture-form";
import {DataElementsProvider} from "../../providers/data-elements/data-elements";
import {OrganisationUnitsProvider} from "../../providers/organisation-units/organisation-units";
import {AppProvider} from "../../providers/app/app";

declare var dhis2: any;

/*
 Generated class for the EventCaptureForm page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-event-capture-form',
  templateUrl: 'event-capture-form.html',
})
export class EventCaptureForm implements OnInit{

  public eventCompleteness : boolean = false;
  public loadingMessages : any = [];
  public loadingMessage : string ="";
  public currentUser : any;
  public currentOrgUnit : any;
  public currentProgram : any;

  public entryFormParameter : any;

  public programStageDataElements : any;
  public programStageSections : any;
  public entryFormSections : any;
  public event : any;
  public dataValues : any;
  public eventComment : string;
  programStages:any;
  dataObject:any;
  dataElementValueObject:any;

  loaded:boolean = false;
  programRules:any;
  programStage:any;
  eventDate:any;
  status:any;
  mandatoryChecker:any = {};
  mandatoryConfirmer:any = {};
  fieldChecker:boolean = false;
  hasCompulsory:boolean = false;

  sameEventIdFromEdit:any

  //pagination controller
  public currentPage : number ;
  public paginationLabel : string = "";
  //network
  public network : any;

  constructor(public params:NavParams,public programsProvider : ProgramsProvider, public user : UserProvider,
              public navCtrl: NavController, public eventCaptureFormProvider : EventCaptureFormProvider,
              public organisationUnitProvider:OrganisationUnitsProvider, public eventsProvider :EventsProvider,
              public appProvider:AppProvider){

  }

  ngOnInit() {
    this.programStageDataElements  = [];
    this.programStageSections = [];
    this.currentPage = 0;
    this.dataObject = {};
    this.dataElementValueObject = {};
    this.user.getCurrentUser().then(user=>{
      this.currentUser = user;
      this.event = true;
      this.entryFormParameter = this.params.get("params");

      if(this.entryFormParameter.eventIdFromEdit){
        this.sameEventIdFromEdit = this.entryFormParameter.eventIdFromEdit
        this.eventDate = this.entryFormParameter.eventDateFromEdit;
        this.eventComment = this.entryFormParameter.notesFromEdit;
        this.status = this.entryFormParameter.statusFromEdit;
      }

      this.currentProgram = this.programsProvider.lastSelectedProgram;
      this.currentOrgUnit = this.organisationUnitProvider.lastSelectedOrgUnit;
      this.loadProgramMetadata();
    });

  }

  ionViewDidLoad() {
  }

  loadProgramMetadata(){

    this.eventCompleteness = false;
    this.loadingMessages = [];
    this.setLoadingMessages("Loading program metadata");
    this.loaded = false;

    this.event = {
      event: dhis2.util.uid(),
      program : this.currentProgram.id,
      programStage: "",
      orgUnit : this.currentOrgUnit.id,
      orgUnitName : this.currentOrgUnit.name,
      status : "",
      eventDate : "",
      completeDate: "",
      attributeCategoryOptions: "",
      attributeOptionCombo: "",
      dataValues : [],
      notes: [],
      syncStatus: ""

    };

    this.eventCaptureFormProvider.getProgramStages(this.currentProgram.id, this.currentUser).then((programStages:any)=>{
       this.programStage = programStages;
      programStages.forEach((progStage:any)=>{
        progStage.programStageDataElements.forEach((sectionInfo:any)=>{
          if(sectionInfo.compulsory){

            this.hasCompulsory = true;
            this.mandatoryChecker[sectionInfo.dataElement.id] = sectionInfo.dataElement.id;
          }

        })
      })
    })
  }

  cancel(){
    this.navCtrl.pop();
  }

  changePagination(page){
    page = parseInt(page);
    if(page == -1){
      this.currentPage = 0;
    }else if(page == this.entryFormSections.length){
      this.currentPage = this.entryFormSections.length - 1;
    }else{
      this.currentPage = page;
    }
    this.paginationLabel = (this.currentPage + 1) + "/"+this.entryFormSections.length;
  }

  setLoadingMessages(message){
    this.loadingMessage = message;
    this.loadingMessages.push(message);
  }



  updateEventData(updateDataValue){
    let id = updateDataValue.id.split("-")[0];
    this.dataElementValueObject[id] = updateDataValue.value;
    this.dataObject[updateDataValue.id] = updateDataValue;

    if(updateDataValue.id.split("-")[0] == this.mandatoryChecker[updateDataValue.id.split("-")[0]]){

       this.mandatoryConfirmer[updateDataValue.id.split("-")[0]] = updateDataValue;

      if(Object.keys(this.mandatoryConfirmer).length >= Object.keys(this.mandatoryChecker).length ){
        this.fieldChecker = true;
      }

    }

  }


  registerEvent(){
    let event ={};
    let notes = [];
    let today = ((new Date()).toISOString()).split('T')[0];
    let eventfomart = [];
    let dataElementInfo = [];
    Object.keys(this.dataElementValueObject).forEach(key=>{
      dataElementInfo.push({
         dataElement: key , value: this.dataElementValueObject[key]
      })
    });

    this.programsProvider.getProgramsStages(this.currentProgram.id, this.currentUser).then((programStages:any)=> {

      notes.push(this.eventComment)

      event ={
        event: (this.sameEventIdFromEdit)?this.sameEventIdFromEdit : dhis2.util.uid(),
        program: this.currentProgram.id,
        programName: this.currentProgram.name,
        programStage: programStages[0].id.split("-")[1],
        orgUnit: this.currentOrgUnit.id,
        orgUnitName: this.currentOrgUnit.name,
        status: this.status,
        eventDate: this.eventDate,
        completeDate: today,
        attributeCategoryOptions: this.entryFormParameter.attribCos,
        dataValues: dataElementInfo,
        notes: notes,
        syncStatus: "not-synced"

      };

      this.eventsProvider.saveEvent(event, this.currentUser).then(() => {


        this.eventCompleteness = true;
        this.appProvider.setNormalNotification("Registered event has been successful saved to local storage");
        this.navCtrl.pop();
      }, error => {
        this.eventCompleteness = true;
        this.appProvider.setTopNotification("Fail to save new event to local storage : " + JSON.stringify(error));
      });

    // },error => {
    //     this.eventCompleteness = true;
    //     this.appProvider.setTopNotification("Fail to save new event to server, will be stored to storage");
    //   });

    });
  }




}
