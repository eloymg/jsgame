var Stats = (function () {


    var counterID = 0;
    var time = 0;
    var Machines = {};

    var singleInstance;
    return function() {
            if ( singleInstance ) return singleInstance;
            singleInstance = this;
            this.createtype = "WebServer";
            this.click = false;
            this.createmode = false;
            this.connectMode = false;
            this.connections = []; //Seguramente pasara a privada

            this.getID = function() {
                var ID = "mach" + counterID;
                counterID += 1;
                return ID
            };
            this.connect = function(){
                if(this.connections[0].constructor.name=="WebServer" &&
                this.connections[1].constructor.name=="Traffic"){
                    this.connections[1].connect(this.connections[0])
                }
                else if(this.connections[0].constructor.name=="Traffic" &&
                this.connections[1].constructor.name=="WebServer"){
                    this.connections[0].connect(this.connections[1])
                }else if(this.connections[0].constructor.name=="WebServer" &&
                this.connections[1].constructor.name=="LoadBalancer"){
                    this.connections[1].connect(this.connections[0])
                }
                else if(this.connections[0].constructor.name=="LoadBalancer" &&
                 this.connections[1].constructor.name=="WebServer"){
                    this.connections[0].connect(this.connections[1])
                }else if(this.connections[0].constructor.name=="LoadBalancer"
                && this.connections[1].constructor.name=="Traffic"){
                    this.connections[1].connect(this.connections[0])
                }
                else if(this.connections[0].constructor.name=="Traffic" &&
                this.connections[1].constructor.name=="LoadBalancer"){
                    this.connections[0].connect(this.connections[1])
                }else{
                    alert("not possible to connect")
                }
                this.connections = [];
            }
            this.GetMachine = function(id){
                return Machines[id]
            }
            this.AddMachine = function(m){
                Machines[m.machineID] = m
            }
            this.DeleteMachine = function(id){
                delete Machines[id]
            }
    }})();
//---------------------------------------------------------------
//---------------------------------------------------------------

function Traffic() {
    this.dataLosted = 0;
    this.packetsgenerated = 0;
    this.objectConnected;

}
Traffic.prototype.connect = function(machineObject) {

    if(this.objectConnected==undefined){
    this.objectConnected = machineObject;
    createLine("asd",50,300,machineObject.posX,machineObject.posY)
    }
}
Traffic.prototype.start = function(){
    var th = this;
    this.bucle = setInterval(function() {
        var packet = generatePacket();
        th.packetsgenerated += packet
        if (th.objectConnected != undefined) {
            th.objectConnected.CPU.packetProccess(packet)

        } else {
            th.dataLosted += packet

        }
    }, 1000)
}
Traffic.prototype.pause = function(){
    clearInterval(this.bucle)
}

//---------------------------------------------------------------
//---------------------------------------------------------------

function PanelMachine() {
    this.boxCPU = document.getElementById("machineCPUvalue");
    this.boxID = document.getElementById("machineIDvalue");
    this.bucle;
    this.chartbucle;
}
PanelMachine.prototype.startShow = function(machineObject) {
    clearInterval(this.bucle);
    deleteChart();
    startChart(machineObject);
    this.boxID.innerHTML = machineObject.machineID
    var t = this;
    this.bucle = setInterval(function() {
        t.boxCPU.innerHTML = machineObject.CPU.currentCPU;
    }, 10);
}
PanelMachine.prototype.stopShow = function() {
    clearInterval(this.bucle);
}

//---------------------------------------------------------------
//---------------------------------------------------------------
function PanelTraffic() {
    this.boxGen = document.getElementById("packetGenerated");
    this.boxLost = document.getElementById("packetLost");
    this.bucle;
}

PanelTraffic.prototype.startShow = function() {

    var th = this;
    this.bucle = setInterval(function() {
        th.boxGen.innerHTML = traf.packetsgenerated;
        th.boxLost.innerHTML = traf.dataLosted;
    }, 10);

}

//---------------------------------------------------------------
//---------------------------------------------------------------

function Machine(posX, posY) {
    this.machineID = s.getID();
    this.posX = posX;
    this.posY = posY;
}
//---------------------------------------------------------------


function WebServer(posX, posY) {
    Machine.call(this, posX, posY);
    this.CPU = {
        packetsprocesed:0,
        maxCPU:4,
        currentCPU:0,
        packetProccess: function(packet) {
            var timeBusy = packet / this.maxCPU * 10

            if (this.currentCPU + (packet / this.maxCPU) < 100) {
                this.currentCPU += packet / this.maxCPU
                this.packetsprocesed += packet
                var th = this;
                setTimeout(function() {
                    th.currentCPU -= packet / th.maxCPU
                }, timeBusy * 1000)

            } else {
                packetLost(packet);
            }
        }
    }
    var radius = 20
    var html = createCir(this.machineID, this.posX, this.posY, radius, "grey")
    document.getElementById("gamebox").append(html);
};
WebServer.prototype = Object.create(Machine.prototype);
WebServer.prototype.constructor = WebServer;



//---------------------------------------------------------------
var i = 0;
function LoadBalancer(posX, posY) {
    Machine.call(this, posX, posY);
    this.CPU = {
    packetsprocesed:0,
    objectConnected:[],
    maxCPU:40,
    currentCPU:0,
    packetProccess: function(packet) {
    var timeBusy = packet / this.maxCPU * 10
    if (this.currentCPU + (packet / this.maxCPU) < 100) {
        this.currentCPU += packet / this.maxCPU
        var th = this;
        th.packetsprocesed += packet
        setTimeout(function() {
            th.currentCPU -= packet / th.maxCPU
        }, timeBusy * 1000)
        setTimeout(function() {
            th.redirectTraffic(packet,"roundrobin");
        }, timeBusy * 500)

    } else {
        packetLost(packet);
    }},
    redirectTraffic : function(packet,mode) {

        if (mode=="roundrobin"){

            if (this.objectConnected.length > 0) {
                this.objectConnected[i].CPU.packetProccess(packet)
            } else {
                packetLost(packet);
            }
            i=(i+1) % (this.objectConnected.length);
            console.log(i)
    }
}
}

};

LoadBalancer.prototype = Object.create(LoadBalancer.prototype);
LoadBalancer.prototype.constructor = LoadBalancer;
LoadBalancer.prototype.create = function() {
    var w = 50;
    var h = 20;
    var rec = createRec(this.machineID, this.posX - w / 2, this.posY - h / 2,
      w, h, "green")
    document.getElementById("gamebox").append(rec);
};
LoadBalancer.prototype.connect = function(machineObject) {


    this.CPU.objectConnected.push(machineObject);
    createLine("asd",this.posX,this.posY,machineObject.posX,machineObject.posY)

}




//---------------------------------------------------------------

function DataBase(posX, posY) {
    Machine.call(this, posX, posY);

};
DataBase.prototype = Object.create(DataBase.prototype);
DataBase.prototype.constructor = DataBase;
DataBase.prototype.create = function() {
    var side = 30;
    var rec = createRec(this.machineID, this.posX - side / 2,
      this.posY - side / 2, side, side, "yellow")
    document.getElementById("gamebox").append(rec);
};

//---------------------------------------------------------------
//---------------------------------------------------------------

var s = new Stats;
var p = new PanelMachine;
var traf = new Traffic;
var ptraf = new PanelTraffic;
ptraf.startShow();
