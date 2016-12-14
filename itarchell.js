function Stats() {
	this.counterID = 0;
	this.time = 0;
	this.createtype = "WebServer";
	this.click = false;
	this.Machines = {};
}
Stats.prototype.getID = function() {
	var ID = "mach"+this.counterID;
	this.counterID+=1;
	return ID
}

function incTraffic() {
	

}



function CPU(maxCPU){
	this.maxCPU = maxCPU
	this.currentCPU = 0;


}

CPU.prototype.packetProccess = function(packet){
	var timeBusy = packet/this.maxCPU*10
	this.currentCPU += packet/this.maxCPU
	setTimeout(function(){this.currentCPU -= packet/this.maxCPU},timeBusy)
}

function Machine(posX,posY) {
  this.machineID = s.getID();
  this.posX = posX;
  this.posY = posY;
  this.CPU = new CPU();
}

function WebServer(posX, posY) {
  Machine.call(this, posX,posY);
  
};
WebServer.prototype = Object.create(Machine.prototype);
WebServer.prototype.constructor = WebServer;
WebServer.prototype.create  = function(){
  var radius = 20
  var cir = createCir(this.machineID,this.posX,this.posY,radius,"grey")
  document.getElementById("gamebox").append(cir);
};

function LoadBalancer(posX, posY) {
  Machine.call(this, posX,posY);
  
};
LoadBalancer.prototype = Object.create(LoadBalancer.prototype);
LoadBalancer.prototype.constructor = LoadBalancer;
LoadBalancer.prototype.create  = function(){
  var w = 50;
  var h = 20;
  var rec = createRec(this.machineID,this.posX-w/2,this.posY-h/2,w,h,"green")
  document.getElementById("gamebox").append(rec);
};

function DataBase(posX, posY) {
    Machine.call(this, posX,posY);

};
DataBase.prototype = Object.create(DataBase.prototype);
DataBase.prototype.constructor = DataBase;
DataBase.prototype.create  = function(){
  var side = 30;
  var rec = createRec(this.machineID,this.posX-side/2,this.posY-side/2,side,side,"yellow")
  document.getElementById("gamebox").append(rec);
};

var s = new Stats;
