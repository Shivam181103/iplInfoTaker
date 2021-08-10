let request = require("request");
let path=require("path");
let cheerio = require("cheerio");
let fs = require("fs");
const { Console } = require("console");
const { first } = require("cheerio/lib/api/traversing");
const { getHeapCodeStatistics } = require("v8");

request('https://www.espncricinfo.com/series/ipl-2020-21-1210595', fn);


function fn(error, response, html) {

    if (error) {
        console.log(error);
    }
    else if (response.statusCode == 404) {
        console.log("Page not Found");
    }
    else {
        getFirstUrl(html);
    }
}

function getFirstUrl(html) {
    let $ = cheerio.load(html);
    let firstLink = $(".widget-items.cta-link").find("a");

    let link = firstLink.attr("href");
    let fullLink = `https://www.espncricinfo.com${link}`;
    //   console.log(fullLink);

    request(fullLink, fnv);

}
function fnv(error, response, html) {

    if (error) {
        console.log(error);
    }
    else if (response.statusCode == 404) {
        console.log("Page not Found");
    }
    else {
        getAllScorecardLink(html);
    }
}

function getAllScorecardLink(html) {
    let $ = cheerio.load(html);
    let linksadd = $(".match-score-block >div> a.match-info-link-FIXTURES");
    console.log(linksadd.length);
    for (let i = 0; i < linksadd.length; i++) {
        let foundlink = $(linksadd[i]).attr("href");
        let fullLinkOfEveryTeam = `https://www.espncricinfo.com${foundlink}`;
        console.log(fullLinkOfEveryTeam);
        console.log("``````````````````````````````````````````` ");

        getData(fullLinkOfEveryTeam);

    }
}

function getData(link)
{

    let playerInfo ={

        TeamName:[],
        PlayerName:[],
        Vanue:[],
        Date:[],
        OpponentTeam:[],
        Result:[],
        Run:[],
        Balls:[],
        Fours:[],
        Sixes:[],
        StrikeRate:[]
    
    
    }



    request(link,fn);
    function fn(error, response, html) {
    
        if (error) {
            console.log(error);
        }
        else if (response.statusCode == 404) {
            console.log("Page not Found");
        }
        else {
            getDataFromLink(html);
        }
        
    }
    
    function getDataFromLink(html)
    {
        let $=cheerio.load(html);
     
        let status=$(".match-header .event .description").text().split(",");
        let vanue=status[1];
        let date=status[2];
        let result=$(".match-header .event .status-text").text();
        // console.log(result);
        // console.log(vanue);
        // console.log(date)
        playerInfo.Vanue=vanue;
        playerInfo.Date=date;
        playerInfo.Result=result;
    
        let tms=$(".match-header .event .teams .team");
        
       let isloser=$(tms[0]).hasClass(".team-gray");
       
        let winningTeam,loserTeam;
        if(isloser==true)
        {
            winningTeam=$(tms[1]).text();
            loserTeam=$(tms[0]).text();
        }
        else{
             winningTeam=$(tms[0]).text();
             loserTeam=$(tms[1]).text();
        }
        //  console.log(winningTeam);
        //  console.log(loserTeam);
    
          let teams=$(".card.content-block.match-scorecard-table>.Collapsible");
          //console.log(teams.length);
          let htmlString="";
          let TeamNames=[];
          for(let i=0;i<teams.length;i++)
          {
            htmlString=$(teams[i]).html(); 
            let TeamName =$(htmlString).find(".header-title").text().split(" ");
            TeamNames.push(TeamName[0]+""+TeamName[1]);
           // console.log(TeamName);
          }
          for(let i=0;i<teams.length;i++)
          {
            htmlString=$(teams[i]).html(); 
            let Team=TeamNames[i];
            playerInfo.TeamName=Team;
            playerInfo.OpponentTeam=TeamNames[(i+1)%2];
              let basepath="C:\\Users\\R.K\\Desktop\\web_dev_practice\\iplInformation";
             let teamPath=path.join(basepath,Team);
            let isexistsTeam=fs.existsSync(teamPath);
            if(isexistsTeam==false)
            {
                fs.mkdirSync(teamPath);
            }
            let batsman=$(htmlString).find(".table.batsman tbody tr");
            for(let i=0;i<batsman.length-1;i+=2)
            {
                let batsmanCol=$(batsman[i]).find("td");
                let name=$(batsmanCol[0]).text().split(" ");
                name=name[0]+"_"+name[1];
                playerInfo.PlayerName=name;
    
                playerInfo.Run=$(batsmanCol[2]).text();
                playerInfo.Balls=$(batsmanCol[3]).text();
                playerInfo.Fours=$(batsmanCol[5]).text();
                playerInfo.Sixes=$(batsmanCol[6]).text();
                playerInfo.StrikeRate=$(batsmanCol[7]).text();
               
    
               let playerfileName=name+".json";
               let playerFilePath=path.join(teamPath,playerfileName);
               let isexistplayer=fs.existsSync(playerFilePath);
               console.log(JSON.stringify(playerInfo));
                if(isexistplayer==false) 
                   fs.writeFileSync(playerFilePath,JSON.stringify(playerInfo));
                   else
                   fs.appendFileSync(playerFilePath,JSON.stringify(playerInfo));
                 
             }
          }
           
    }
}

