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


  getProgramStages(programId, currentUser){
    let stageSectionIds = [];
    let dataElementIds = [];
    let newStageData = [];
    let stageSectionMapper = {};
    let dataElementMapper = {};
     return new Promise((resolve, reject) =>  {
      this.programsProvider.getProgramsStages(programId,currentUser).then((programsStages:any)=>{
        programsStages.forEach((programsStage:any)=>{
          programsStage.programStageDataElements.forEach((programStageDataElement)=>{
            dataElementIds.push(programStageDataElement.dataElement.id);
          });
          programsStage.programStageSections.forEach((stageSectionId:any)=>{
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
