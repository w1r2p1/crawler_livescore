var express = require('express')
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;

var server = require('http').createServer(app);
var port = process.env.PORT || 8080;

var list_doi_bong = require('./app/constant/const.js');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'livescore',
    charset: 'utf8'
});

connection.connect();

var job_result  = require('./app/functions/RunJob.js');
var init = require('./app/functions/RunOneTime.js');
var list_doi_bong = require('./app/constant/const.js');
var live = require('./app/functions/live.js');
var lis_tab_laydoibong = [3, 7, 2, 5, 53, 1];

 new CronJob('*/10 * * * *', function () {

    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        var leagueID = list_doi_bong[$i].LeagueID;
        if (typeof leagueID != 'undefined') {
            job_result.getLichThiDau('http://bongdaso.com/_ComingMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1&Odd=1',request, cheerio,connection);
            job_result.getKetQuaThiDau('http://bongdaso.com/_PlayedMatches.aspx?LeagueID=' + leagueID + '&SeasonID=-1&Period=1',request, cheerio,connection);
        }
    }

 }, null, true, 'Asia/Ho_Chi_Minh');

new CronJob('*/30 * * *', function () {

    for (var $i = 0; $i < list_doi_bong.length; $i++) {
        var leagueID = list_doi_bong[$i].LeagueID;
        if (typeof leagueID != 'undefined') {
            job_result.getBangXepHang('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID,request, cheerio,connection);
        }
    }

}, null, true, 'Asia/Ho_Chi_Minh');

new CronJob('*/15 * * * *', function () {

    live.UpdateDienBienTranDauDangDienRa(request, cheerio,connection);

}, null, true, 'Asia/Ho_Chi_Minh');

//ham chay 1 lam
//init.getListTeam(connection,list_doi_bong);
//
// for (var $i = 0; $i < list_doi_bong.length; $i++) {
//     var leagueID = list_doi_bong[$i].LeagueID;
//     if (typeof leagueID != 'undefined') {
//         init.getBangXepHangCacNam('http://bongdaso.com/Standing.aspx?LeagueID=' + leagueID,request,cheerio,connection);
//     }
// }
//

// connection.query('truncate doi_bong', function (error, result) {
//     if (!error) {
//
//     } else {
//         console.log(error);
//     }
// });
//
// for (var $i = 0; $i < lis_tab_laydoibong.length; $i++) {
//     init.genListDoiBong('http://bongdaso.com/Association.aspx?FBAssID=' + lis_tab_laydoibong[$i] + '&Tab=1', connection,request,cheerio);
// }

// connection.query('SELECT id,link_team FROM doi_bong', function (error, result) {
//     if (!error) {
//         for (var $i=0; $i< result.length; $i++){
//               init.getLinkCralerPlayer(result[$i].id,result[$i].link_team,connection,request,cheerio);
//         }
//     } else {
//         console.log(error);
//     }
// });

connection.query('SELECT link_player FROM doi_bong', function (error, result) {
    if (!error) {
        for (var $i=0; $i< result.length; $i++){
            if(result[$i].link_player !='') {
                live.GetCauThu(result[$i].link_player,connection,request, cheerio);
            }
        }
    } else {
        console.log(error);
    }
});

//ket thuc ham chay 1 lan

app.set('view engine', 'ejs');
require('./app/routes.js')(app, connection,request,cheerio,server);

server.listen(port, '127.0.0.1', function (err) {
    console.log('listen port: ', port);
});

function exitHandler(options, err) {
    connection.end();
    if (options.cleanup)
        console.log('clean');
    if (err)
        console.log(err.stack);
    if (options.exit)
        process.exit();
}

process.on('exit', exitHandler.bind('', {cleanup: true}));




