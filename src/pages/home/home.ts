import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {BLE} from 'cordova-plugin-ble/ble';
import {Platform} from 'ionic-angular';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private platform : Platform) {
    console.log('try execute apps');
  this.platform.ready().then(()=>{console.log('Android ready to use'); });
  console.log('!!!!!!!!!');
  this.scan();
  
}


scan(){
console.log('startscanning.....');
BLE.startScan(this.onDeviceFound,this.onScanError);
console.log('finishscanning.....');
}


onDeviceFound(device){
  console.log('devicesfound'+JSON.stringify(device));
}
onScanError(error){
  console.log('scan error'+error);
}


}
