import { Component, OnDestroy } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
@Component({
  selector: 'page-cadence',
  templateUrl: 'cadence.html',

})

export class CadencePage implements OnDestroy {


  cadns_val: any = 0;
  chart: any;
  options: any = {
    chart: {
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false
    },
    credits: {
      enabled: false
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
    }]
  };
  subscription: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public ble: BLE) { }

  ionViewDidEnter() {
    this.CadenceVal();
  }


  saveInstance(chartInstance) {
    //for chart appearence
    this.chart = chartInstance;
  }

  CadenceVal() {
    console.log('start getting cads values');
    this.subscription = this.ble.startNotification("F5:56:71:04:1B:60"
      , "99ddcda5-a80c-4f94-be5d-c66b9fba40cf", "99dd0305-a80c-4f94-be5d-c66b9fba40cf")
      .subscribe(cadence => {
        this.cadns_val = this.onData(cadence);
        if (this.cadns_val[0] != 0) {
          setTimeout(() => { this.UpdateGauge(this.cadns_val[0]) }, 750);
        }
        else {
          this.UpdateGauge(0);
        }
        console.log('cadence value' + this.cadns_val[0]);
      },
      error => { console.log('thisispb:' + error); });
  }

  UpdateGauge(data: any) {
    this.chart.series[0].setData([]);
    this.chart.series[0].setData([data]);
  }



  onData(buffer) {
    var data = new Uint8Array(buffer);
    return data;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
