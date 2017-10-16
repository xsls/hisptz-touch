import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {SqlLiteProvider} from "../sql-lite/sql-lite";
import {HttpClientProvider} from "../http-client/http-client";
import {AppProvider} from "../app/app";

/*
 Generated class for the EventsProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular DI.
 */
@Injectable()
export class EventsProvider {

  public resource : string;
  lastChoosedOrgUnit: any;

  constructor(public http: Http, private sqlLite : SqlLiteProvider,public httpClient: HttpClientProvider, public appProvider:AppProvider) {
    this.resource = "events";
  }

  setLastChoosedOrgUnit(orgUnitId){
    this.lastChoosedOrgUnit = orgUnitId;
  }

  getLastChoosedOrgUnit(){
    return this.lastChoosedOrgUnit;
  }

  downloadEventsFromServer(orgUnit,program,currentUser){
    let url = "/api/25/events.json?orgUnit="+orgUnit.id+"&program="+program.id ;

    return new Promise((resolve, reject) =>{
      this.httpClient.get(url,currentUser).then((eventsData: any)=>{
        eventsData = JSON.parse(eventsData.data);

        // alert("Events Downloaded Length: "+JSON.stringify(eventsData.events.length))

        resolve(eventsData)

      },error=>{
        reject(error);
        this.appProvider.setTopNotification("Downloading events from server failed")
      });
    });
  }


  /**
   * get formatted datavalues for event
   * @param dataElementValueObject
   * @param programStageDataElements
   * @returns {Promise<T>}
   */
  getEventDataValues(dataElementValueObject,programStageDataElements){
    let dataValues = [];
    return new Promise((resolve, reject) =>{
      programStageDataElements.forEach((programStageDataElement:any)=>{
        let dataElementId = programStageDataElement.dataElement.id;
        if(dataElementValueObject[dataElementId]){
          dataValues.push({
            dataElement : dataElementId, value : dataElementValueObject[dataElementId]
          })
        }
      });
      resolve(dataValues)
    });
  }


  /**
   * get dhis 2 formatted event
   * @param value
   * @returns {string}
   */
  getFormattedDate(value){
    let month,date = (new Date(value));
    month = date.getMonth() + 1;
    let formattedDate = date.getFullYear() + '-';
    if(month > 9){
      formattedDate = formattedDate + month + '-';
    }else{
      formattedDate = formattedDate + '0' + month + '-';
    }
    if(date.getDate() > 9){
      formattedDate = formattedDate + date.getDate();
    }else{
      formattedDate = formattedDate + '0' +date.getDate();
    }
    return formattedDate;
  }

  /**
   * loading 50 most recent events from the server
   * @param orgUnit
   * @param program
   * @param dataDimensions
   * @param currentUser
   * @returns {Promise<T>}
   */
  loadEventsFromServer(orgUnit,program,programComboId,attribcc, attribCos,currentUser){
    // alert("dataDim :"+JSON.stringify(programComboId))
    alert("dataDim :"+attribCos.toString())
    let url = "/api/25/events.json?orgUnit="+orgUnit.id + "&programStage="+program.id;
    if(attribCos.length > 0){
      let attributeCos = attribCos.toString();
      //attributeCos = attributeCos.replace(/,/g, ';');
      url += "&attributeCc="+programComboId+"&attributeCos="+attributeCos;
    }
    url += "&pageSize=50&page=1&totalPages=true";
    return new Promise((resolve, reject) =>{
      this.httpClient.get(url,currentUser).then((eventsData: any)=>{
        eventsData = JSON.parse(eventsData.data);
        resolve(eventsData)

      },error=>{
        reject(error);
      });
    });
  }





  /**
   * loading all events fro local storage using
   * @param orgUnit
   * @param program
   * @param currentUser
   * @returns {Promise<T>}
   */
  loadingEventsFromStorage(orgUnit,program,currentUser){
    let attribute = "orgUnit";
    let attributeArray = [];
    let events = [];
    attributeArray.push(orgUnit.id);
    return new Promise((resolve, reject)=>{
      this.sqlLite.getDataFromTableByAttributes(this.resource,attribute,attributeArray,currentUser.currentDatabase).then((offlineEvents : any)=>{
        //program.id
        offlineEvents.forEach((offlineEvent:any)=>{
          if(offlineEvent.program == program.id){
            events.push(offlineEvent);
          }
        });
        resolve(events);
      },error=>{
        reject(error);
      })
    });
  }

  /**
   * get event by event table id
   * eventTableId == programId+"-"+orgUnitId+"-"+eventId
   * @param eventTableId
   * @param currentUser
   * @returns {Promise<T>}
   */
  loadingEventByIdFromStorage(eventTableId,currentUser){
    let attribute = "event";
    let attributeArray = [];
    attributeArray.push(eventTableId);
    return new Promise((resolve, reject)=>{
      this.sqlLite.getDataFromTableByAttributes(this.resource,attribute,attributeArray,currentUser.currentDatabase).then((offlineEvents : any)=>{
        if(offlineEvents.length > 0){
          resolve(offlineEvents[0]);
        }else{
          resolve({});
        }
      },error=>{
        reject(error);
      })
    });
  }

  /**
   * get events by status
   * @param currentUser
   * @param status
   * @returns {Promise<T>}
   */
  getEventsFromStorageByStatus(status,currentUser){
    let attribute = "syncStatus";
    let attributeArray = [];
    attributeArray.push(status);
    return new Promise((resolve, reject)=>{
      this.sqlLite.getDataFromTableByAttributes(this.resource,attribute,attributeArray,currentUser.currentDatabase).then((events : any)=>{
        resolve(events);
      },error=>{
        reject(error)
      });
    })
  }

  /**
   * get event list as sections for easy pagination
   * @param events
   */
  getEventSections(events){
    let pager = 4;
    let sectionsCounter = Math.ceil(events.length/pager);
    let sections = [];
    return new Promise((resolve, reject)=>{
      for(let index = 0; index < sectionsCounter; index ++){
        sections.push({
          name : "defaultSection",
          id : index,
          events :events.splice(0,pager)
        });
      }
      resolve(sections);
    });

  }

  getEventListInTableFormat(events,dataElementToDisplay){
    return new Promise((resolve, reject)=>{
      let tableFormat = {
        header : [],rows : []
      };
      //set headers
      //alert("toDisplaay: "+JSON.stringify(dataElementToDisplay))

      Object.keys(dataElementToDisplay).forEach((dataElementId:any)=>{
        tableFormat.header.push({
          id : dataElementToDisplay[dataElementId].id, name : dataElementToDisplay[dataElementId].name
        })
      });
      //setting rows
      this.getEventDataValuesMapper(events).then((eventDataValuesMapper:any)=>{
        events.forEach((event:any)=>{

          let dataValueMapper = eventDataValuesMapper[event.event];
          let row = {event : event.event,data : []};
          tableFormat.header.forEach((header : any)=>{
            let value =(dataValueMapper[header.id])? dataValueMapper[header.id] : "";
            row.data.push(value)
          });
          tableFormat.rows.push(row);
        });
        resolve(tableFormat);
      })
    });
  }

  getEventDataValuesMapper(events){
    return new Promise((resolve, reject)=>{
      let eventDataValuesMapper = {};
      events.forEach((event : any)=>{
        let dataValueMapper = {};
        event.dataValues.forEach((dataValue : any)=>{
          dataValueMapper[dataValue.dataElement] = dataValue.value;
        });
        eventDataValuesMapper[event.event] = dataValueMapper;
      });
      //alert("DataValue Mapper: "+JSON.stringify(eventDataValuesMapper))
      resolve(eventDataValuesMapper);
    });
  }


  /**
   * get formatted events
   * @param event
   * @returns {any}
   */
  formatEventForUpload(event){
    delete event.id;
    delete event.syncStatus;
    delete event.orgUnitName;
    delete event.programName;

    // if(event.completedDate == "0"){
    //   delete event.completedDate;
    // }
    if(event.attributeCategoryOptions == "0"){
      delete event.attributeCategoryOptions;
    }
    if(event.notes == "0"){
      delete event.notes;
    }else{
      event.notes = String(event.notes);
    }
    delete event.notes;
    delete event.event;
    return event;
  }

  /**
   * saving events downloaded from the server
   * @param eventsFromServer
   * @param currentUser
   * @returns {Promise<T>}
   */
  savingEventsFromServer(eventsFromServer,currentUser){
    return new Promise((resolve, reject)=>{
      if(eventsFromServer.events.length == 0){
        resolve();
      }else{
        let bulkData = [];
        for(let event of eventsFromServer.events){
          let eventData = event;
          eventData["eventDate"] = this.getFormattedDate(event.eventDate);
          eventData["syncStatus"] = "synced";
          eventData["id"] = event.program + "-"+event.orgUnit+ "-" +event.event;
          bulkData.push(eventData);
        }
        this.sqlLite.insertBulkDataOnTable(this.resource,bulkData,currentUser.currentDatabase).then(()=>{
          resolve();
        },error=>{
          console.log(JSON.stringify(error));
          reject(error);
        });
      }
    })
  }

  /***
   * saving single event
   * @param event
   * @param currentUser
   * @returns {Promise<T>}
   */
  saveEvent(event,currentUser){
    event["id"] = event.program + "-"+event.orgUnit+ "-" +event.event;
    return new Promise((resolve, reject)=>{
      this.sqlLite.insertDataOnTable(this.resource,event,currentUser.currentDatabase).then((success)=>{
        resolve();
      },error=>{
        reject();
      });
    });
  }



  uploadEventsToServer(events,currentUser){
    let modifiedEvent = [];
    return new Promise((resolve, reject)=>{
       events.forEach((event:any)=> {
        if(event["syncStatus"] == "not-synced"){
          //delete event id for new event
          let eventTobUploaded = event;
          let eventToUpload = this.formatEventForUpload(eventTobUploaded);
          let url = "/api/25/events";
          console.log(JSON.stringify(eventToUpload));

          modifiedEvent.push(eventTobUploaded)

          this.httpClient.post(url ,eventToUpload,currentUser).then(response=>{
            //response = response.json();
            console.log(JSON.stringify(response));
            //alert("Succes 1 :"+JSON.stringify(response))

            this.updateUploadedLocalStoredEvent(event,response,currentUser).then(()=>{
            },error=>{
            });
          },error=>{
            alert("error 1 :"+JSON.stringify(error))
            console.log("error on post : " + JSON.stringify(error));
          })
        }else{
          let eventTobUploaded ={};
          // alert("see final event :"+JSON.stringify(event))
           let url = "/api/events.json";
          this.httpClient.post(url, JSON.stringify(event) ,currentUser).then(response=>{
            // response = JSON.parse(response);
            //alert("Succes 2 :"+JSON.stringify(response))
            this.updateUploadedLocalStoredEvent(event,response,currentUser).then(()=>{
            },error=>{

            });
          },error=>{
            alert("error 2 :"+JSON.stringify(error))
            console.log("error on put : " + JSON.stringify(error));
          })
        }
       });
      //
      resolve();
    });
  }


  updateUploadedLocalStoredEvent(event,response,currentUser){
    response = response.response;
    if(response.importSummaries[0].reference){
      event.event = response.importSummaries[0].reference;
    }
    event["syncStatus"] = "synced";
    return new Promise((resolve, reject)=>{
      this.saveEvent(event,currentUser).then(response=>{
        resolve();
      },error=>{
        reject();
      })
    })
  }


  deleteEventsByIds(eventIds, currentUser) {
    let resource = "events"
    let successCount = 0;
    let failCount = 0;
    return new Promise( (resolve, reject)=> {
      for(let dataValueId of eventIds){
        this.sqlLite.deleteFromTableByAttribute(resource,"event",dataValueId, currentUser.currentDatabase).then(()=> {
          successCount = successCount + 1;
          if((successCount + failCount) == eventIds.length){
            resolve();
          }
        }, error=> {
          failCount = failCount + 1;
          if((successCount + failCount) == eventIds.length){
            resolve();
          }
        });
      }
    });
  }



}
