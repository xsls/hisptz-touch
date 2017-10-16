import {Component, Input, OnInit} from '@angular/core';
import {NavController, NavParams} from "ionic-angular";

/**
 * Generated class for the DataElementSyncComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'data-element-sync-component',
  templateUrl: 'data-element-sync.html'
})
export class DataElementSyncComponent implements OnInit{

  @Input() dataElements;
  @Input() forEvents;

  public loadingMessage : string = "Preparing data";
  public isLoading : boolean = true;
   // forEvent : boolean = true;


  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ngOnInit() {
    if(this.dataElements){
      this.isLoading = false;
    }

    // this.dataElements.forEach((dataElement:any)=>{
    //   alert("event tejjdkhkjue")
    //   if(dataElement.dataElement){
    //     // this.forEvent = true;
    //     alert("event teue")
    //   }else{
    //     this.forEvent = false;
    //   }
    // })

    // if(this.dataElements[0].dataElement){
    //   this.forEvent = true;
    // }else{
    //   this.forEvent = false;
    // }
  }


}
