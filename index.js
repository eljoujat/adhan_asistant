'use strict'

const pt=require("./PrayTimes.js");

let Client = require('castv2-client').Client;
let DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
let GoogleTTS = require('google-tts-api');
let schedule = require('node-schedule');


pt.setMethod("UOIF");

pt.tune({fajr: -66, dhuhr: -56,asr:-61,maghrib:-57,isha:-55});


let App = {
    playin: false,
    DeviceIp: "",
    Player: null,
    GoogleHome: function (host, url, callback) {
        let client = new Client();
        client.connect(host, function () {
            client.launch(DefaultMediaReceiver, function (err, player) {
                let media = {
                    contentId: "https://s3.eu-west-3.amazonaws.com/azanaudio/136_uP_bY_mUSLEm.Ettounssi.mp3",
                    contentType: 'audio/mp3',
                    streamType: 'BUFFERED'
                };
                App.Player = player;
                App.Player.load(media, { autoplay: true }, function (err, status) {
                    App.Player.on('status', function (status) {
                        if (status.playerState === "IDLE" && App.playin === false) {
                            App.Player.stop();
                            client.close();
                            App.playin = false;
                        }
                    });
                });
            });
        });
        client.on('error', function (err) {
            console.log('Error: %s', err.message);
            client.close();
            callback('error');
        });
    },
    run: function (ip, text) {
        App.DeviceIp = ip;
        let lang = "en";
        GoogleTTS(text, lang, 1).then(function (url) {
            App.GoogleHome(App.DeviceIp, url, function (res) {
                console.log(res);
            });
        });
    }
};









//console.log("Tomorrow ");

let hours=[];
let minutes=[];
let toDay=new Date();
for(let i=0; i<7; i++){
    let next_date=new Date(toDay);
    next_date.setDate(toDay.getDate() + 1);

    let prayer_times=pt.getTimes(next_date,[48.52, 2.20], +2);
    const fajr_hour_i = parseInt(prayer_times.fajr.split(':')[0]);
    const fajr_minute_i=parseInt(prayer_times.fajr.split(':')[1]);

    const dhuhr_hour_i=parseInt(prayer_times.dhuhr.split(':')[0]);
    const dhuhr_minute_i=parseInt(prayer_times.dhuhr.split(':')[1]);

    const asr_hour_i=parseInt(prayer_times.asr.split(':')[0]);
    const asr_minute_i=parseInt(prayer_times.asr.split(':')[1]);

    const maghrib_hour_i=parseInt(prayer_times.maghrib.split(':')[0]);
    const maghrib_minute_i=parseInt(prayer_times.maghrib.split(':')[1]);

    const isha_hour_i=parseInt(prayer_times.isha.split(':')[0]);
    const isha_minute_i=parseInt(prayer_times.isha.split(':')[1]);

    hours.push(fajr_hour_i,dhuhr_hour_i,asr_hour_i,maghrib_hour_i,isha_hour_i);
    minutes.push(fajr_minute_i,dhuhr_minute_i,asr_minute_i,maghrib_minute_i,isha_minute_i);

    toDay=next_date;
}




function sechedulePrayerTimes(hours, minutes){

    console.log("schedlung salawt for ");
    console.log("hours "+hours);
    console.log("minutes "+minutes);
    for (let i = 0; i < hours.length; i++) {
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        rule.hour = hours[i];
        rule.minute = minutes[i];

        let j = schedule.scheduleJob(rule, function(){
            App.run("192.168.0.17", "It's time for Salat Ichaa  ");
            console.log(" First adhan")
        });
    }
}

let test_hours=[12,12]
let test_minutes=[55,59]
sechedulePrayerTimes(test_hours,test_minutes);