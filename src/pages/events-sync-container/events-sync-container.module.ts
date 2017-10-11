import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {SharedModule} from "../../components/shared.module";
import {AboutModule} from "../../components/about.module";
import {EventsSyncContainerPage} from "./events-sync-container";

@NgModule({
  declarations: [
   EventsSyncContainerPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsSyncContainerPage),SharedModule, AboutModule
  ],
})
export class EventsSyncPageModule {}
