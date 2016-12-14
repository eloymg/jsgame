function createCir(id,cx,cy,r,fill){

  var cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cir.setAttribute('id',id)
  cir.setAttribute('cx',cx);
  cir.setAttribute('cy',cy);
  cir.setAttribute('r',r);
  cir.setAttribute('onclick','clickleft(event,this.id)')
  cir.setAttribute('oncontextmenu','clickright(event,this.id)')
  cir.setAttribute("fill", fill);
  return cir

}

function createRec(id,x,y,w,h,fill){

  var rec = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rec.setAttribute('id',id)
  rec.setAttribute('x',x);
  rec.setAttribute('y',y);
  rec.setAttribute('width',w);
  rec.setAttribute('height',h);
  rec.setAttribute('onclick','clickleft(event,this.id)')
  rec.setAttribute('oncontextmenu','clickright(event,this.id)')
  rec.setAttribute("fill", fill);
  return rec

}

function clickleft(event,id){
  s.click = true;
  
}
function clickright(event,id){
  document.getElementById(id).remove()
  delete s.Machines[id]
}
function createMachine() {

var offset = document.getElementById("gamebox").getBoundingClientRect();
  var x = event.clientX-offset.left
  var y = event.clientY-offset.top

  switch(s.createtype) {
    case "WebServer":
        var m = new WebServer(x,y);
        break;
    case "LoadBalancer":
        var m = new LoadBalancer(x,y);
        break;
    case "DataBase":
        var m = new DataBase(x,y);
        break;
    default:
        var m = new WebServer(x,y);
}
  m.create();
  return m


}
function gameclick(){

  if (s.click == false){
    var m = createMachine();
    var ID = m.machineID
    s.Machines[ID] = m ;
  
}
s.click =false;
}


function showNodeData(object) {

  
  var currentCPU = object.CPU.currentCPU;
  boxCPU = document.getElementById("machineCPUvalue");
  setInterval(function(){boxCPU.innerHTML=currentCPU;},10)

}