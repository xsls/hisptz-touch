import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SettingsProvider} from "../../providers/settings/settings";
import {ActionSheetController} from "ionic-angular";

/**
 * Generated class for the TrackedEntityInputsComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'event-capture-form-inputs',
  templateUrl: 'event-capture-form-inputs.html'
})
export class EventCaptureFormInputComponent implements OnInit{

  @Input() programStageDataElement;
  @Input() currentUser;
  @Input() mandatory;
  @Input() data ;
  @Output() onChange = new EventEmitter();

  fieldLabelKey : any;
  textInputField : Array<string>;
  numericalInputField : Array<string>;
  supportValueTypes : Array<string>;
  formLayout : string;

  constructor(private settingProvider : SettingsProvider,private actionSheetCtrl : ActionSheetController) {}

  ngOnInit(){
    this.numericalInputField = ['INTEGER_NEGATIVE','INTEGER_POSITIVE','INTEGER','NUMBER','INTEGER_ZERO_OR_POSITIVE'];
    this.textInputField = ['TEXT','LONG_TEXT'];
    this.supportValueTypes = ['BOOLEAN','TRUE_ONLY','DATE','TEXT','LONG_TEXT','INTEGER_NEGATIVE','INTEGER_POSITIVE','INTEGER','NUMBER','INTEGER_ZERO_OR_POSITIVE'];

    if(this.programStageDataElement && this.programStageDataElement.id){
      this.fieldLabelKey = this.programStageDataElement.dataElement.name;
      this.formLayout = "listLayout";
      this.settingProvider.getSettingsForTheApp(this.currentUser).then((appSettings : any)=>{
        let dataEntrySettings = appSettings.entryForm;
        if(dataEntrySettings.formLayout){
          this.formLayout = dataEntrySettings.formLayout;
        }
        if(dataEntrySettings.label){
          if(this.programStageDataElement[dataEntrySettings.label]){
            this.fieldLabelKey = this.programStageDataElement[dataEntrySettings.label];
          }
        }
      });
    }
  }

  showTooltips(){
    let title = this.fieldLabelKey;
    let subTitle = "";
    if(this.programStageDataElement.dataElement.description){
      title += ". Description : " + this.programStageDataElement.description ;
    }
    subTitle += "Value Type : " +this.programStageDataElement.dataElement.valueType.toLocaleLowerCase().replace(/_/g," ");
    if(this.programStageDataElement.dataElement.optionSet){
      title += ". It has " +this.programStageDataElement.dataElement.optionSet.options.length + " options to select.";
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: title,subTitle:subTitle
    });
    actionSheet.present();
  }

  updateValue(updatedValue){
    this.onChange.emit(updatedValue);
  };

}
