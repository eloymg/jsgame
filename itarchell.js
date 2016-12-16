function Stats() {
    this.counterID = 0;
    this.time = 0;
    this.createtype = "WebServer";
    this.click = false;
    this.Machines = {};
    this.createmode = false;
}
Stats.prototype.getID = function() {
    var ID = "mach" + this.counterID;
    this.counterID += 1;
    return ID
}

//---------------------------------------------------------------
//---------------------------------------------------------------

function Traffic() {
    this.dataLosted = 0;
    this.lastPacketGenerated = 0;
    this.objectConnected;
    var th = this;
    setInterval(function() {
        th.lastPacketGenerated = generatePacket();
        if (th.objectConnected != undefined) {
            th.objectConnected.CPU.packetProccess(th.lastPacketGenerated)
        } else {
            th.dataLosted += th.lastPacketGenerated
        }
    }, 500)
}
Traffic.prototype.connect = function(machineObject) {
    this.objectConnected = machineObject;
}

//---------------------------------------------------------------
//---------------------------------------------------------------

function PanelMachine() {
    this.boxCPU = document.getElementById("machineCPUvalue");
    this.boxID = document.getElementById("machineIDvalue");
    this.bucle;
}
PanelMachine.prototype.startShow = function(machineObject) {
    clearInterval(this.bucle);
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
        th.boxGen.innerHTML = traf.lastPacketGenerated;
        th.boxLost.innerHTML = traf.dataLosted;
    }, 10);

}

//---------------------------------------------------------------
//---------------------------------------------------------------

function Machine(posX, posY) {
    this.machineID = s.getID();
    this.posX = posX;
    this.posY = posY;
    this.CPU = new CPU(4);
    this.incomingPackets = [];
}

function CPU(maxCPU) {
    this.maxCPU = maxCPU
    this.currentCPU = 0;

}
CPU.prototype.packetProccess = function(packet) {
    var timeBusy = packet / this.maxCPU * 10
    if (this.currentCPU + (packet / this.maxCPU) < 100) {
        this.currentCPU += packet / this.maxCPU
        var th = this;
        setTimeout(function() {
            th.currentCPU -= packet / th.maxCPU
        }, timeBusy * 1000)

    } else {
        packetLost(packet);
    }
}


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