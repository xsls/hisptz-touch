import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import {User} from "../../providers/user/user";
import {AppProvider} from "../../providers/app-provider/app-provider";
import {HttpClient} from '../../providers/http-client/http-client';
import {SqlLite} from "../../providers/sql-lite/sql-lite";


/*
  Generated class for the About page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  providers : [User,AppProvider,HttpClient,SqlLite]
})
export class About {

  public loadingData : boolean = false;
  public loadingMessages : any = [];
  public systemInformation : any;
  public appInformation : any;

  constructor(private toastCtrl: ToastController,private user : User,private appProvider : AppProvider,private httpClient : HttpClient,private sqlLite : SqlLite) {
    this.loadingSystemInformation();
  }

  ionViewDidLoad() {
    //console.log('Hello About Page');
  }

  loadingSystemInformation(){
    this.loadingData = true;
    this.loadingMessages = [];
    this.setLoadingMessages('Loading system information');
    this.user.getCurrentUserSystemInformation().then(systemInformation=>{
      this.systemInformation = this.getArrayFromObject(systemInformation);
      this.loadAppInformation();
    });
  }

  loadAppInformation(){
    this.setLoadingMessages('Loading app information');
    this.appProvider.getAppInformation().then(appInformation=>{
      this.appInformation = this.getArrayFromObject(appInformation);
      this.loadingData = false;
    })
  }

  getArrayFromObject(object){
    let array = [];
    for(let key in object){
      let newValue = object[key];
      if(newValue instanceof Object) {
        newValue = JSON.stringify(newValue)
      }
      let newKey = (key.charAt(0).toUpperCase() + key.slice(1)).replace(/([A-Z])/g, ' $1').trim();
      array.push({key : newKey,value : newValue})
    }
    return array;
  }

  setLoadingMessages(message){
    this.loadingMessages.push(message);
  }

  setToasterMessage(message){
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  setStickToasterMessage(message){
    let toast = this.toastCtrl.create({
      message: message,
      showCloseButton : true
    });
    toast.present();
  }

}