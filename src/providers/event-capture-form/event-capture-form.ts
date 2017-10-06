import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {ProgramsProvider} from "../programs/programs";
import {DataElementsProvider} from "../data-elements/data-elements";
import {reject} from "q";

/*
  Generated class for the EventCaptureFormProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class EventCaptureFormProvider {

  public programStageDataElementsMapper : any;
  usedDataElements: any;
  dataElementsInUse:any;
  programTracked: any;
  programOrgUnits:any;
  programRules:any;
  programRulesVariables:any;
  programRulesIndicators:any;
  programStageArrays:any;
  programStage:any;

  programObject: any = { name:"", id:"", enrollmentDateLabel:"", programType:"", onlyEnrollOnce:"", completeEventsExpiryDays:"", ignoreOverdueEvents:"",
    skipOffline:"",     selectIncidentDatesInFuture:"", incidentDateLabel:"",  withoutRegistration:"", captureCoordinates:"", displayFrontPageList:"",
    useFirstStageDuringRegistration:"", categoryCombo: "", programRuleVariables:[], programTrackedEntityAttributes:[], attributeValues:[],
    programIndicators:[], validationCriterias:[], programStages:[ ], translations:[], organisationUnits:[], programRules:[]
  };




  constructor(public http: Http, public programsProvider:ProgramsProvider, public dataElementProvider:DataElementsProvider) {
    this.programStageDataElementsMapper = {};

  }

  /**
   * gey event capture form metadata
   * @param programStageSections
   * @param programStageDataElements
   * @returns {Promise<T>}
   */
  getEventCaptureEntryFormMetaData(programStageSections,programStageDataElements){
    this.programStageDataElementsMapper = {};
    programStageDataElements.forEach((programStageDataElement:any)=>{
      this.programStageDataElementsMapper[programStageDataElement.id] = programStageDataElement;
    });
    let self = this;
    return new Promise(function(resolve, reject) {
      if(programStageSections.length > 0){
        resolve(self.getSectionEntryForm(programStageSections));
      }else{
        resolve(self.getDefaultEntryForm(programStageDataElements));
      }
    });

  }

  /**
   * get section form for event capture
   * @param programStageSections
   * @returns {Array}
   */
  getSectionEntryForm(programStageSections){
    let sections = [];
    programStageSections.forEach((programStageSection: any,index : any)=>{
      sections.push({
        name : programStageSection.name,
        id : index,
        programStageDataElements : this.getSectionDataElements(programStageSection.programStageDataElements)
      })
    });
    return sections;
  }

  /**
   * get program stage data element by section
   * @param programStageDataElementsIdsArray
   * @returns {Array}
   */
  getSectionDataElements(programStageDataElementsIdsArray){
    let programStageDataElements = [];
    programStageDataElementsIdsArray.forEach((programStageDataElement :any)=>{
      programStageDataElements.push(this.programStageDataElementsMapper[programStageDataElement.id]);
    });
    return programStageDataElements;
  }

  /**
   * get default form for event capture form
   * @param programStageDataElements
   * @returns {Array}
   */
  getDefaultEntryForm(programStageDataElements){
    let pager = programStageDataElements.length;
    let sectionsCounter = Math.ceil(programStageDataElements.length/pager);
    let sections = [];
    for(let index = 0; index < sectionsCounter; index ++){
      sections.push({
        name : "defaultSection",
        id : index,
        programStageDataElements :programStageDataElements.splice(0,pager)
      });
    }
    return sections;
  }

//-----------------------------------------------------------------------------------------------------------------------------------

  loadingprogramInfo(programId, currentUser){
    let progTracked = [];
    this.usedDataElements = [];
    this.programOrgUnits = [];
    this.programRulesVariables = [];
    this.programRules = [];
    this.programRulesIndicators = [];
    this.programTracked = [];
    // this.programsProvider.getProgramstrackedEntityAttribute(programId,currentUser).then((program : any)=>{
    this.programsProvider.getProgramById(programId,currentUser).then((program : any)=>{
      //alert("ProgramStages, : "+JSON.stringify(program.useFirstStageDuringRegistration))
        // .programType  .withoutRegistration  .ignoreOverdueEvents  .skipOffline .selectIncidentDatesInFuture .enrollmentDateLabel .captureCoordinates
        // .displayFrontPageList .useFirstStageDuringRegistration .categoryCombo=  .attributeValues= .validationCriterias= .translations=

      this.programObject.programType = program.programType;
      this.programObject.withoutRegistration = program.withoutRegistration;
      this.programObject.ignoreOverdueEvents = program.ignoreOverdueEvents;
      this.programObject.skipOffline = program.skipOffline;
      this.programObject.selectIncidentDatesInFuture = program.selectIncidentDatesInFuture;
      this.programObject.incidentDateLabel = program.enrollmentDateLabel;
      this.programObject.captureCoordinates = program.captureCoordinates;
      this.programObject.displayFrontPageList = program.displayFrontPageList;
      this.programObject.useFirstStageDuringRegistration = program.useFirstStageDuringRegistration;
      this.programObject.categoryCombo = program.categoryCombo;
      this.programObject.attributeValues = program.attributeValues;
      this.programObject.categoryCombo = program.categoryCombo;
      this.programObject.validationCriterias = program.validationCriterias;
      this.programObject.translations = program.translations;

      this.programTracked.push({
        name: program.name,
        id: program.id
        // dataElements: ""
      })


      this.getProgramStages(programId,currentUser).then((programStageDataElements:any)=>{


         //alert("ProgStageDataElemenyt  :"+JSON.stringify(programStageDataElements));
          // .programId .name .sortOrder .programStageSections

        this.programObject.name = programStageDataElements.name;
        this.programObject.id = programStageDataElements.programId;
        // this.programObject.pros = programStageDataElements.name;
        // this.programObject.name = programStageDataElements.name;

        programStageDataElements.programStageDataElements.forEach((programStageDataElement)=>{
          this.usedDataElements.push(programStageDataElement.dataElement.id)
          //alert("id: "+JSON.stringify(programStageDataElement.dataElement.id));//dataElement Ids
          //alert("id: "+JSON.stringify(programStageDataElement.dataElement.id));//dataElement Ids

          //this.programStageDataElements.push(programStageDataElement);

          if(programStageDataElements.programStageDataElements.length == this.usedDataElements.length){

            this.getUsedDataElementsProperty(Array.from(new Set(this.usedDataElements)), programId,currentUser);
          }
        });

        // this.getUsedDataElementsProperty(Array.from(new Set(this.usedDataElements)),currentUser);
        //alert("used DataElements: "+JSON.stringify(this.usedDataElements));//dataElement Id
      });

      this.programsProvider.getOrganisationUnitsinPrograms(programId,currentUser.currentDatabase).then((listOrg:any)=>{
        listOrg.forEach((orgs:any)=>{
          this.programOrgUnits.push({
            id: orgs.orgUnitId
          });

          if(listOrg.length == this.programOrgUnits.length && this.programOrgUnits.length > 0){

            this.programObject.organisationUnits = this.programOrgUnits;
          }

        })
      });

      this.programsProvider.getProgramRules(programId,currentUser.currentDatabase).then((listProgRule:any)=>{
        listProgRule.forEach((rule:any)=>{
          this.programRules.push({
            id: rule.programRuleId
          });

          if(listProgRule.length == this.programRules.length && this.programRules.length > 0){
            this.programObject.programRules = this.programRules;
          }

        })
      });

      this.programsProvider.getProgramRulesVariables(programId,currentUser.currentDatabase).then((listProgRuleVar:any)=>{

        listProgRuleVar.forEach((ruleVar:any)=>{
          this.programRulesVariables.push({
            id: ruleVar.programRuleVariableId
          });

          if(listProgRuleVar.length == this.programRulesVariables.length && this.programRulesVariables.length > 0){
            this.programObject.programRulesVariables = this.programRulesVariables;
          }

        })
      });

      this.programsProvider.getProgramIndicators(programId,currentUser.currentDatabase).then((listProgIndcators:any)=>{

        listProgIndcators.forEach((indicator:any)=>{
          this.programRulesIndicators.push({
            name:indicator.name,
            id: indicator.id,
            expression: indicator.expression
          });

          if(listProgIndcators.length == this.programRulesIndicators.length && this.programRulesIndicators.length > 0){
            this.programObject.programIndicators = this.programRulesIndicators;
          }

        })
      })


    });
  }

  getUsedDataElementsProperty(usedDataElements,programId,currentUser) {

    let programStageElementGroup = [];
    let dataElementArrays = [];
    this.dataElementsInUse = [];
    this.programStageArrays = [];
    this.programStage = [];


    usedDataElements.forEach((dataId: any) => {

      this.programsProvider.getProgramsStages(programId, currentUser).then((programStageDataElements: any) => {
        //alert("ProgramStageDataElements :" + JSON.stringify(programStageDataElements));

        this.dataElementProvider.getDataElementsByName(dataId, currentUser).then((dataElement: any) => {

          programStageDataElements.programStageDataElements.forEach((programStageDataElement) => {

            programStageElementGroup.push({
              id: programStageDataElement.id ,
              displayInReports: programStageDataElement.displayInReports,
              compulsory: programStageDataElement.compulsory,
              allowProvidedElsewhere: programStageDataElement.allowProvidedElsewhere,
              allowFutureDate: programStageDataElement.allowFutureDate,
              dataElement: dataElement
            })


          });

          if(programStageDataElements.programStageDataElements.length == programStageElementGroup.length){
            //alert("Fetched Element :"+JSON.stringify(programStageElementGroup))

            this.programStage.push({
              name: programStageDataElements.name,
              id: programStageDataElements.id.split("-")[1],
              sortOrder: programStageDataElements.sortOrder,
              programStageDataElements: programStageElementGroup
            })

          }

          this.dataElementsInUse.push({
            id: dataElement[0].id,
            name: dataElement[0].name,
            formName: dataElement[0].formName,
            valueType: dataElement[0].valueType,
            optionSet: dataElement[0].optionSet
          })

          //alert("DataElements: "+JSON.stringify(dataElement));//dataElement ID    displayName formName  valueType optionSet

          if(usedDataElements.length == this.dataElementsInUse.length) {

            this.programObject.programStages = this.programStage;

           // alert("Final object: " + JSON.stringify(this.programStage))
            //return this.programObject;
          }
        });


      })



    });

    }


    // getProgramObject(){
    // return this.programStage ;
    // }


    // getRequiredProgramStage(){
    //
    // }






  //------------------------------------------------------------------------------------------------------------------------------------


  getProgramStages(programId, currentUser){
    let stageSectionIds = [];
    let dataElementIds = [];
    let newStageData = [];
    let stageSectionMapper = {};
    let dataElementMapper = {};
     return new Promise((resolve, reject) =>  {
      this.programsProvider.getProgramsStages(programId,currentUser).then((programsStages:any)=>{
        //obtain section ids
        //programstage sections
        //merge program stage with program stage sections

        programsStages.forEach((programsStage:any)=>{
          programsStage.programStageDataElements.forEach((programStageDataElement)=>{
            dataElementIds.push(programStageDataElement.dataElement.id);
          });

          programsStage.programStageSections.forEach((stageSectionId:any)=>{
            //alert("Stag "+JSON.stringify(stageSectionId.id))
            stageSectionIds.push(stageSectionId.id);
          });

        });
        this.dataElementProvider.getDataElementsByIdsForEvents(dataElementIds,currentUser).then((dataElements : any)=>{
          this.programsProvider.getProgramStageSectionsByIdsForEvents(stageSectionIds, currentUser).then((stageSectionData:any)=>{

            dataElements.forEach((dataElement : any)=>{
              dataElementMapper[dataElement.id] = dataElement;
            });
            stageSectionData.forEach((stageSection:any)=>{
              stageSectionMapper[stageSection.id] = stageSection;
            });

            programsStages.forEach((programsStage:any)=>{
              programsStage.programStageDataElements.forEach((programStageDataElement)=>{
                let dataElementId = programStageDataElement.dataElement.id;
                if(dataElementId && dataElementMapper[dataElementId]){
                  programStageDataElement.dataElement = dataElementMapper[dataElementId]
                }
              });
            });


            programsStages.forEach((programStage:any)=>{
              programStage.programStageSections.forEach((stageSectionId:any)=>{
                newStageData.push(stageSectionMapper[stageSectionId.id]);
              });

              programStage.programStageSections = newStageData;


            });

            resolve(programsStages);



          });



        }).catch(error=>{reject(error)});
      }).catch(error=>{reject(error)});
     });

  }



  getProgramStagesSection(programId,currentUser){

    let stageSectionIds = [];
    let newStageData = [];
    let stageSectionMapper = {};
    return new Promise((resolve, reject)=>{

      this.programsProvider.getProgramsStages(programId,currentUser).then((programsStages:any)=>{
        programsStages.forEach((programStage:any)=>{


          programStage.programStageSections.forEach((stageSectionId:any)=>{
            //alert("Stag "+JSON.stringify(stageSectionId.id))
            stageSectionIds.push(stageSectionId.id);
          });
        });

        this.programsProvider.getProgramStageSectionsByIdsForEvents(stageSectionIds, currentUser).then((stageSectionData:any)=>{
          alert("Stag "+JSON.stringify(stageSectionData))
          stageSectionData.forEach((stageSection:any)=>{
            stageSectionMapper[stageSection.id] = stageSection;
          });

          programsStages.forEach((programStage:any)=>{
            programStage.programStageSections.forEach((stageSectionId:any)=>{
                 newStageData.push(stageSectionMapper[stageSectionId.id]);
            });
            programStage.programStageSections = newStageData;
          });
          resolve(programsStages);
        }).catch(error=>{reject(error)});


      });




    })
  }



}
