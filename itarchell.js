var Stats = (function () {

    var counterID = 0;
    var counterPacketID = 0;	 
    var time = 0;
    var Machines = {};
    var singleInstance;
    var LivingPackets = {};	
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
	    this.getPacketID = function() {
		 var ID = "p" + counterPacketID;
		 counterPacketID;   
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
// Traffic object
function Traffic() {
    this.dataLosted = 0;
    this.packetsgenerated = 0;
    this.connectionIN;
    this.connectionOUT;
    this.packetsOUT = [];
    this.packetsIN = [];
    this.packetReg = [];
}
Traffic.prototype.start = function(){
    var th = this;
    this.bucle = setInterval(function() {
        var packet = generatePacket();
	th.packetsOUT.push(packet);    
    }, 1000)
    this.bucleReg = setInterval(function() {
	if(th.packetReg != 0){    
	var d = new Date().getTime()/1000;
	for(let [index,value] of th.packetReg.entries()){
		
    		if(d-value[1]>value[2]){
		th.packetReg.splice(index,1);	
		}
    
	}}
    },500)
}
Traffic.prototype.pause = function(){
    clearInterval(this.bucle)
}
Traffic.prototype.on = function(){
	var th = this
    this.sendBucle = setInterval(function (){
	if(th.packetsOUT==0){
	console.log("no packets to process");
	}else if(th.connectionOUT== undefined){
	console.log("no connection");
	}
        else{
	var packet = th.packetsOUT.pop();	
	th.connectionOUT.packets.push(packet);
	var t = new Date().getTime()/1000;	
	th.packetReg.push([packet.ID,packet.TTL,t]);	
	};
    },1001);

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
//--------------------------------------------------------------
//---------------------------------------------------------------
// Packet class
function Packet(size){
	this.ID = s.getPacketID();
	this.size = size;
	this.loc = "traffic"
	this.Status = "NP";
	this.TTL = 20;
}
Packet.prototype.Process = function(){

}

//---------------------------------------------------------------
// Connection class
function Connection(speed,IN,OUT){
	this.speed;
	this.IN=IN;
	this.OUT=OUT;
	this.packets = [];
}







//---------------------------------------------------------------
//---------------------------------------------------------------
// Machine class
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
//---------------------------------------------------------------

var s = new Stats;
var p = new PanelMachine;
var traf = new Traffic;
var ptraf = new PanelTraffic;
ptraf.startShow();
