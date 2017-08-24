import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CadencePage } from '../pages/cadence/cadence';
import { ChartModule} from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import {  BLE }  from '@ionic-native/ble';



export function highchartsFactory() {
const highcharts = require('highcharts');
const highChartsMore = require('highcharts/highcharts-more');
const solidGauge = require('highcharts/modules/solid-gauge');
ChartModule.forRoot(require('highcharts'),
    require('highcharts/highcharts-more'),
    require('highcharts/modules/solid-gauge'));
  return highcharts;
}
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CadencePage
  ],
  imports: [
    BrowserModule,
    ChartModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CadencePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BLE,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {
provide: HighchartsStatic,
useFactory: highchartsFactory
}
  ]
})
export class AppModule {}
