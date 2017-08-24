import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
@Component({
  selector: 'page-cadence',
  templateUrl: 'cadence.html',

})

export class CadencePage {
  cadns_val: any = 0;
  show_cd: boolean = false;
  chart: any;
  options: any;

  constructor(public navCtrl: NavController, private event: Events, public navParams: NavParams, public ble: BLE) {
    this.options = {
      chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false
      },

      title: {
        text: 'Speedometer'
      },

      pane: {
        startAngle: -150,
        endAngle: 150,
        background: [{
          backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, '#FFF'],
              [1, '#333']
            ]
          },
          borderWidth: 0,
          outerRadius: '109%'
        }, {
          backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, '#333'],
              [1, '#FFF']
            ]
          },
          borderWidth: 1,
          outerRadius: '107%'
        }, {
          // default background
        }, {
          backgroundColor: '#DDD',
          borderWidth: 0,
          outerRadius: '105%',
          innerRadius: '103%'
        }]
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 200,

        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',

        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: {
          step: 2,
          rotation: 'auto'
        },
        title: {
          text: 'km/h'
        },
        plotBands: [{
          from: 0,
          to: 120,
          color: '#55BF3B' // green
        }, {
          from: 120,
          to: 160,
          color: '#DDDF0D' // yellow
        }, {
          from: 160,
          to: 200,
          color: '#DF5353' // red
        }]
      },

      series: [{
        name: 'Speed',
        data: [0],
        tooltip: {
          valueSuffix: ' km/h'
        }
      }]
    };
    /*after setting gauge option subscribe to cadence notif*/
    console.log('gauge setted');
    this.event.subscribe('gaugeVal', (data) => { this.UpdateGauge(data); });
  }




  ionViewDidEnter() {
    console.log('ionViewDidEnter CadencePage');
    this.CadenceVal();
  }

  CadenceVal() {
    console.log('start getting cads values');
    this.ble.startNotification("F5:56:71:04:1B:60"
      , "99ddcda5-a80c-4f94-be5d-c66b9fba40cf", "99dd0305-a80c-4f94-be5d-c66b9fba40cf")
      .subscribe(cadence => {
        this.cadns_val = this.onData(cadence);
        console.log('cadence value' + this.cadns_val);
        this.event.publish('gaugeVal', this.cadns_val);
      },
      error => { console.log('thisispb:' + error); });
  }
  //action to execute each time a cadence val captured
  UpdateGauge(data: any) {
    this.chart.series[0].setData([]);
    console.log('UpdateGauge' + data);
    this.chart.series[0].setData([data]);
  }
  saveInstance(chartInstance): void {
    this.chart = chartInstance;
  }
  onData(buffer) {
    var data = new Uint8Array(buffer);
    return data;
  }


}
