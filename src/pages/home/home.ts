import { Component, NgZone } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController         } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { CadencePage } from '../cadence/cadence';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {


  /*-------- UUIDs------*/
  id: string; //Sole identifier
  Bt_service: string;
  Bt_char: string;
  rev_service: string;
  rev_char: string;
  flashdt_service: string;
  flashdt_char: string;
  cadns_service: string;
  cadns_char: string;

  /*----Characteristecs Value -----*/
  revolution_nb: any = 0;
  Bt_lev: number;
  batteryLevel: any;
  last_revolution_nb: any = 0;
  /*-----Intermediate vars : Boolean vars are for displaying HTML elements------*/
  isRev: boolean = false;
  isValid: boolean = false;
  RevoSubscription: any;
  /*------------- Methods ------------*/
  constructor(private ngZone: NgZone,private toastCtrl: ToastController, public load: LoadingController, public navCtrl: NavController, private platform: Platform, public ble: BLE) {
    this.ble.isEnabled().then(() => {
      console.log(' bl ok start scanning now');
      this.scan();
    },
      () => {
        console.log(' bl not ok enable it and start scanning');
        this.ble.enable().then(() => {
          console.log('go go');
          this.scan();
        });
      });

  }
  scan() {
    this.ble.startScan([]).subscribe(devices => {
      if (devices.id == 'F5:56:71:04:1B:60') {
        this.ble.stopScan().then
          (() => {
            console.log('DEVICE FOUND: ' + devices.name);
            this.id = devices.id;
          });
        this.connect(devices.id);
      }
    });
  }
/* to connect  to the peripheral and get  his UUIDs
we could define a json file where  we declare UUID's as constant*/
  connect(id_dev: string) {

    this.ble.connect(id_dev).subscribe(peripheralData => {
      this.Bt_service = peripheralData.characteristics[10].service;
      this.cadns_service = peripheralData.characteristics[13].service;
      this.rev_service = peripheralData.characteristics[12].service;
      this.flashdt_service = peripheralData.characteristics[14].service;
      this.Bt_char = peripheralData.characteristics[10].characteristic;
      this.cadns_char = peripheralData.characteristics[13].characteristic;
      this.rev_char = peripheralData.characteristics[12].characteristic;
      this.flashdt_char = peripheralData.characteristics[14].characteristic;
      this.read_battery_level();
      this.notify_battery_level();
    }, peripheralData => {
     this.presentToast();
      console.log('disconnected:(');
    });
  }
  /*------------------------ Battery Setting---------------*/

/*ngZone used to allow angular bind data in real time
*/
  read_battery_level() {
    this.isValid = true;
    this.ble.read(this.id, this.Bt_service, this.Bt_char)
      .then(battery_level => {
        console.log('reading now');
        var level = this.onData(battery_level);
        this.ngZone.run(() => { this.batteryLevel = level[0]; });
        console.log('data is binding' + this.batteryLevel);
        console.log('finish reading');
      })
      .catch(error => { console.log('failure' + error); });
  }

  notify_battery_level() {
    console.log('subscribe to notify');
    this.ble.startNotification(this.id, this.Bt_service, this.Bt_char)
      .subscribe(notificationdata => {
        var dt = this.onData(notificationdata);
        this.ngZone.run(() => { this.batteryLevel = dt[0]; });
        console.log('notify :' + this.batteryLevel);
      });
  }


  /*------------------------Cadence Setting---------------*/
  get_cadence() {
    this.navCtrl.push(CadencePage);
  }
  /*------------------------Revolution Number Setting---------------*/

  get_revolution_number() {

    this.isRev =!this.isRev;
      this.ble.read(this.id, this.rev_service, this.rev_char)
      .then(revolution_data => {
        this.ngZone.run(() => { this.last_revolution_nb = new Uint32Array(revolution_data);});
        console.log(' last revolution nb :' + this.last_revolution_nb);
      });

    console.log('Start Getting Revo Number');
   this.RevoSubscription= this.ble.startNotification(this.id, this.rev_service, this.rev_char)
      .subscribe(revolution_data => {
        var revolution__data_view = new Uint32Array(revolution_data);
        var nb = (revolution__data_view[0] & 0xff) +
          ((revolution__data_view[1] & 0xff) << 8) +
          ((revolution__data_view[2] & 0xff) << 16) +
          ((revolution__data_view[3] & 0xff) << 24);
        this.revolution_nb = nb - this.last_revolution_nb-1;
        this.ngZone.run(() => { this.revolution_nb; });
        console.log('rev_c:' + this.revolution_nb);
      });
  }



  // get_chunk() {
  //   console.log('start getting chunk');
  //   this.ble.read(this.id, this.flashdt_service, this.flashdt_char)
  //     .then(chunk_data => {
  //       var chunk_data_view = this.onData(chunk_data);
  //       var rslt = chunk_data_view[0] + ((chunk_data_view[1] & 0x0f) << 8);
  //       var rt = chunk_data_view[5];
  //       console.log('chunk_details' + rslt);
  //       console.log('avercd:' + rt);
  //     })
  //     .catch(Error => { console.log('chinkerr' + Error); });

  // }

  onData(buffer) {
//Convert received data in array buffer
    var data = new Uint8Array(buffer);
    return data;
  }

  ionViewWillLeave(){
     this.RevoSubscription.unsubscribe();
  }

/*Sometimes Sole disconnect automatically
this function is called when disconnect from sole*/
  presentToast() {
   let toast = this.toastCtrl.create({
    message: ' You are now disconnected ! Restart Application to reconnect',
    duration: 10000,
    position: 'top'
  });
  toast.present();
}
}
