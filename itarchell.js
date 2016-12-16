function Stats() {
    this.counterID = 0;
    this.time = 0;
    this.createtype = "WebServer";
    this.click = false;
    this.Machines = {};
    this.createmode = false;
    this.connections = [];
    this.connectMode = false;
}
Stats.prototype.getID = function() {
    var ID = "mach" + this.counterID;
    this.counterID += 1;
    return ID
}
Stats.prototype.connect = function(){



    if(this.connections[0].constructor.name=="WebServer" && this.connections[1].constructor.name=="Traffic"){
        this.connections[1].connect(this.connections[0])
    }
    else if(this.connections[0].constructor.name=="Traffic" && this.connections[1].constructor.name=="WebServer"){
        this.connections[0].connect(this.connections[1])
    }else if(this.connections[0].constructor.name=="WebServer" && this.connections[1].constructor.name=="LoadBalancer"){
        this.connections[1].connect(this.connections[0])
    }
    else if(this.connections[0].constructor.name=="LoadBalancer" && this.connections[1].constructor.name=="WebServer"){
        this.connections[0].connect(this.connections[1])
    }else if(this.connections[0].constructor.name=="LoadBalancer" && this.connections[1].constructor.name=="Traffic"){
        this.connections[1].connect(this.connections[0])
    }
    else if(this.connections[0].constructor.name=="Traffic" && this.connections[1].constructor.name=="LoadBalancer"){
        this.connections[0].connect(this.connections[1])
    }else{
        alert("not possible to connect")
    }
    this.connections = [];
}

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

Machine.prototype.CPU = {
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
}}




//---------------------------------------------------------------


function WebServer(posX, posY) {
    Machine.call(this, posX, posY);

};
WebServer.prototype = Object.create(Machine.prototype);
WebServer.prototype.constructor = WebServer;
WebServer.prototype.create = function() {
    var radius = 20
    var cir = createCir(this.machineID, this.posX, this.posY, radius, "grey")
    document.getElementById("gamebox").append(cir);
};

//---------------------------------------------------------------

function LoadBalancer(posX, posY) {
    Machine.call(this, posX, posY);
    
};

LoadBalancer.prototype = Object.create(LoadBalancer.prototype);
LoadBalancer.prototype.constructor = LoadBalancer;
LoadBalancer.prototype.create = function() {
    var w = 50;
    var h = 20;
    var rec = createRec(this.machineID, this.posX - w / 2, this.posY - h / 2, w, h, "green")
    document.getElementById("gamebox").append(rec);
};
LoadBalancer.prototype.connect = function(machineObject) {

    if(this.CPU.objectConnected==undefined){
    this.CPU.objectConnected = machineObject;
    createLine("asd",this.posX,this.posY,machineObject.posX,machineObject.posY)
    }
}
LoadBalancer.prototype.CPU = {
    packetsprocesed:0,
    objectConnected:undefined,
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
            th.redirectTraffic(packet);
        }, timeBusy * 500)

    } else {
        packetLost(packet);
    }},
    redirectTraffic : function(packet) {
        
        if (this.objectConnected != undefined) {
            this.objectConnected.CPU.packetProccess(packet)
        } else {
            packetLost(packet);
        }
}
}


//---------------------------------------------------------------

function DataBase(posX, posY) {
    Machine.call(this, posX, posY);

};
DataBase.prototype = Object.create(DataBase.prototype);
DataBase.prototype.constructor = DataBase;
DataBase.prototype.create = function() {
    var side = 30;
    var rec = createRec(this.machineID, this.posX - side / 2, this.posY - side / 2, side, side, "yellow")
    document.getElementById("gamebox").append(rec);
};

//---------------------------------------------------------------
//---------------------------------------------------------------

var s = new Stats;
var p = new PanelMachine;
var traf = new Traffic;
var ptraf = new PanelTraffic;
ptraf.startShow();