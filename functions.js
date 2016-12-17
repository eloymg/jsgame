function createCir(id, cx, cy, r, fill) {
    var cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cir.setAttribute('id', id)
    cir.setAttribute('cx', cx);
    cir.setAttribute('cy', cy);
    cir.setAttribute('r', r);
    cir.setAttribute('onclick', 'clickleft(event,this.id)')
    cir.setAttribute('oncontextmenu', 'clickright(event,this.id)')
    cir.setAttribute("fill", fill);
    return cir
}

function createRec(id, x, y, w, h, fill) {
    var rec = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rec.setAttribute('id', id)
    rec.setAttribute('x', x);
    rec.setAttribute('y', y);
    rec.setAttribute('width', w);
    rec.setAttribute('height', h);
    rec.setAttribute('onclick', 'clickleft(event,this.id)')
    rec.setAttribute('oncontextmenu', 'clickright(event,this.id);showNodeData(this.id);')
    rec.setAttribute("fill", fill);
    return rec
}

function createLine(id, x1, y1, x2, y2) {
    var lin = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lin.setAttribute('id', id)
    lin.setAttribute('x1', x1);
    lin.setAttribute('y1', y1);
    lin.setAttribute('x2', x2);
    lin.setAttribute('y2', y2);
    lin.setAttribute('stroke-width', '2')
    lin.setAttribute('stroke', 'black')
    document.getElementById("gamebox").append(lin);
}

function clickleft(event, id) {
        s.click = true;
        showNodeData(id);
        addObjectToConnections(s.Machines[id])
        if(s.connections.length==2){
            s.connect();
        }   
}

function clicktraf(){
        s.click = true;
        addObjectToConnections(traf)
        if(s.connections.length==2){
            s.connect();
        } 
}

function clickright(event, id) {
    document.getElementById(id).remove()
    delete s.Machines[id]
}

function createMachine() {
    var offset = document.getElementById("gamebox").getBoundingClientRect();
    var x = event.clientX - offset.left
    var y = event.clientY - offset.top
    switch (s.createtype) {
        case "WebServer":
            var m = new WebServer(x, y);
            break;
        case "LoadBalancer":
            var m = new LoadBalancer(x, y);
            break;
        case "DataBase":
            var m = new DataBase(x, y);
            break;
        default:
            var m = new WebServer(x, y);
    }
    m.create();
    return m
}

function gameclick() {
    if (s.click==false && s.createmode ==false){
        resetConnections();
    }
    if (s.click == false && s.createmode == true) {
        var m = createMachine();
        var ID = m.machineID
        s.Machines[ID] = m;
        p.stopShow();  
        s.createmode = false;
    }
    
    s.click = false;
}

function showNodeData(machineID) {
    var m = s.Machines[machineID];
    p.startShow(m);
}

function pressCreateButton(type) {
    s.createtype = type;
    s.createmode = true;
}

function generatePacket() {
    var r = Math.random();
    var packet = (r * 20 | 0);
    return packet;
}

function packetLost(packet) {
    traf.dataLosted += packet
}

function resetConnections(){

    s.connections = [];

}
function addObjectToConnections(machineObject){

    s.connections.push(machineObject);

}
function deleteChart() {
    var canvas = document.getElementById("myChart");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(p.chartBucle);
    
}
function startChart(machineObject) {
    var count = 50;
    var axisx = Array.apply(null, {
        length: count
    }).map(Number.call, Number);
    var dataarray = Array.apply(null, {
        length: count
    }).map(Number.prototype.valueOf, 0);
    var data = {
        labels: axisx,
        datasets: [{
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: dataarray
        }]
    }
    var updateData = function(oldData) {
        var labels = oldData["labels"];
        var dataSet = oldData["datasets"][0]["data"];
        labels.shift();
        count++;
        labels.push(count.toString());
        var newData = machineObject.CPU.currentCPU;
        dataSet.push(newData);
        dataSet.shift();
    };

    var optionsAnimation = {
        scaleOverride: true,
        scaleSteps: 10,
        scaleStepWidth: 10,
        scaleStartValue: 0
    }
    var optionsNoAnimation = {
        animation: false,
        scaleOverride: true,
        scaleSteps: 10,
        scaleStepWidth: 10,
        scaleStartValue: 0
    }
    var ctx = document.getElementById("myChart").getContext("2d");
    var myNewChart = new Chart(ctx, {
        options: {
            scales: {
                xAxes: [{
                    display: false
                }]
            }
        }
    });
    myNewChart.Line(data, optionsAnimation);
    p.chartBucle = setInterval(function() {
        updateData(data);
        myNewChart.Line(data, optionsNoAnimation);
    }, 1000);
}