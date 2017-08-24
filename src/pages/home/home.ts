import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
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

  /*----Characteristec Values -----*/
  revolution_nb: any;
  Bt_lev: number;


  /*-----Intermediate vars------*/
  connection: boolean = false;
  last_revolution_nb: any = 0;

  /*------------- Methods ------------*/
  constructor(public navCtrl: NavController, private platform: Platform, public ble: BLE) {
    platform.ready().then(() => {
      console.log('Android ready to use');
    });

    if (ble.isEnabled()) {
      console.log('step one cool');

    }
    else {
      ble.enable();
      console.log('ble activate.');
    }
    console.log('ble!ok');

    this.scan();

  }

  scan() {
    this.ble.startScan([]).subscribe(devices => {
      if (devices.id == 'F5:56:71:04:1B:60') {
        this.ble.stopScan().then
          (() => {
            console.log('DEVICE FOUND' + devices.name);
            this.id = devices.id;
          });
        this.connect(devices.id);
      }
    });
  }

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
      console.log("tall001"+ this.cadns_char);
      this.read_battery_level();
    }, peripheralData => {
      console.log('disconnected:(');
    });
    this.connection = true;
  }


  read_battery_level() {
    this.ble.startNotification(this.id, this.Bt_service, this.Bt_char)
      .subscribe(notificationdata => {
        var dt = this.onData(notificationdata);
        this.Bt_lev = dt[0];
        alert('Battery level : ' + this.Bt_lev);
      });
  }

  // get_revolution_number() {
  //   this.ble.read(this.id, this.rev_service, this.rev_char)
  //     .then(revolution_data => {
  //       this.last_revolution_nb = new Uint32Array(revolution_data);
  //       console.log(' last revolution nb :' + this.last_revolution_nb);
  //     });

  //   console.log('start getting revonumber');
  //   this.ble.startNotification(this.id, this.rev_service, this.rev_char)
  //     .subscribe(revolution_data => {
  //       var revolution__data_view = new Uint32Array(revolution_data);
  //       var nb = (revolution__data_view[0] & 0xff) +
  //         ((revolution__data_view[1] & 0xff) << 8) +
  //         ((revolution__data_view[2] & 0xff) << 16) +
  //         ((revolution__data_view[3] & 0xff) << 24);
  //       this.revolution_nb = nb - this.last_revolution_nb;
  //       console.log('rev_c:' + this.revolution_nb);
  //     });
  // }

  get_cadence() {
    this.navCtrl.push(CadencePage);
    console.log('id****'+JSON.stringify(this.id));
  }

  get_chunk() {
    console.log('start getting chunk');
    this.ble.read(this.id, this.flashdt_service, this.flashdt_char)
      .then(chunk_data => {
        var chunk_data_view = this.onData(chunk_data);
        var rslt = chunk_data_view[0] + ((chunk_data_view[1] & 0x0f) << 8);
        var rt = chunk_data_view[5];
        console.log('chunk_details' + rslt);
        console.log('avercd:' + rt);
      })
      .catch(Error => { console.log('chinkerr' + Error); });

  }

  onData(buffer) {
    var data = new Uint8Array(buffer);
    return data;
  }

}

