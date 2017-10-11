import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import {SharedModule} from "./shared.module";
import {DataSetSyncComponent} from "./data-set-sync/data-set-sync";
import {DataElementSyncComponent} from "./data-element-sync/data-element-sync";
import {EventSyncComponent} from "./event-sync/event-sync";

@NgModule({
  declarations: [DataSetSyncComponent, DataElementSyncComponent, EventSyncComponent],
  imports: [
    IonicModule,SharedModule
  ],
  exports: [DataSetSyncComponent, DataElementSyncComponent, EventSyncComponent]
})

export class AboutModule { }
