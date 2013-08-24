'use strict';
var gako = gako || {};

//Names of charts methods
var 
	addCircleLine = 'addCircleLine',
	addGraph = 'addGraph';



//Chart figure/line class
gako.chartFigure = function (params){
    this.type = params.type;
    this.circles = params.circles;
    this.chartLine = params.chartLine;
    this.chartFill = params.chartFill;
    this.color = params.color;
    this.checkbox = params.checkbox;
    this.label = params.label;
    this.averageLine = params.averageLine;
    this.strokeWidth = params.strokeWidth;

    this.initCircleEvents = function () { };
}

gako.graphChart = function(params){ 

    //Public
    this.placeHolder = document.getElementById(params.placeHolder);
    this.chartWidth = params.width;
    this.chartHeight = params.height;
	this.title = params.title;
	this.chart = gako.utility.createChart(this); 
    this.yRange = params.yRange;
	this.padding = 40;
    this.toolTip = gako.utility.createToolTip(params);
	this.infoLine = gako.utility.createInfoLine(params);
	this.detailsBox = gako.utility.createDetailsBox(this);
	this.charts = [];
	this.valueLabels = params.valueLabels;
	
    //Private
    this.maxHeight = params.maxHeight;// In Use
    this.stripesPadding;// In Use
    
    
    if(params.hasOwnProperty('title')){
        gako.utility.addTitle(this);
    }
    
    if(params.hasOwnProperty('addAxisX')){
        if(params.addAxisX){
            gako.utility.addAxisX(this);
        }
    }
    
    if(params.hasOwnProperty('addAxisY')){
        if(params.addAxisY){
            gako.utility.addAxisY(this);
        }
    } 
    
};

gako.graphChart.prototype[addCircleLine] = function(/*JSON, obj, array*/ content, /* boolean */ showAverage){
	
	var _content = {}; //Need to be outside of the method in class
	
	if (content instanceof Array) {
		_content = {
            name : 'Chart ' + (this.charts.length + 1),
			description : '',
            values : content,
			infos : []
        };
    }else if(typeof content == String){
        _content = JSON.parse(content);
    }else if(content instanceof Object){

		_content.values = [];
		_content.infos = [];
		_content.name = content.name;
		_content.description = content.description;
		for(var i in content.values){
			//There is value and info property
			if(content.values[i] instanceof Object){
				_content.values.push(content.values[i].value);
				_content.infos.push(content.values[i].info);
			
			}else{
				//Its only number without info
				_content.values.push(content.values[i]);
				_content.infos.push("No Info");
			}
		}
	}
    
    var padding = this.padding;

    var chartFigure = new gako.chartFigure ({
        circles : [],
        chartLine : document.createElementNS(gako.utility.w3spec, 'polyline'),
        color : gako.utility.generateColor(this.charts.length).color,
        checkbox : document.createElement('input'),
        label : document.createElement('label'),
		averageLine : document.createElementNS(gako.utility.w3spec, 'line'), // Need to be deleted
		strokeWidth : 4,
		type: addCircleLine
    });
    
    var g = document.createElementNS(gako.utility.w3spec, 'g'),
        nodeFragment = document.createDocumentFragment(),
        posX = padding,
        posY = 0,
        spaceX = (this.chartWidth - 2 * padding)/ (_content.values.length - 1),
        points = '',
        pointsX = [],
        pointsY = [];
  
    

    var totalContentSum = 0;
    for (var i in _content.values){
        posY = this.chartHeight - ((_content.values[i] / this.yRange) * (this.stripesPadding)) - padding;
        points += ' ' + posX + ',' + posY;
        pointsX.push(posX);
        pointsY.push(posY);
        posX += spaceX;
        totalContentSum += _content.values[i];
    }
	
    chartFigure.chartLine.setAttribute('points', points);
    chartFigure.chartLine.setAttribute('fill', 'none');
    chartFigure.chartLine.setAttribute('stroke', chartFigure.color);
    chartFigure.chartLine.setAttribute('stroke-width', chartFigure.strokeWidth);
    
	
	/*
	*	Creates the checkboxes - Need to be put outside
	*/
	
	//For design prop.
	var cbWrapper = document.createElement('div');
	cbWrapper.setAttribute('class', 'cbWrapp');
	
	var colorHolder = document.createElement('div');
	colorHolder.setAttribute('class', 'checkBoxColor');
	colorHolder.setAttribute('name', _content.name);
	colorHolder.style.backgroundColor = chartFigure.color;
	
    var checkboxID = gako.utility.generateID();
    chartFigure.checkbox.setAttribute('type', 'checkbox');
    chartFigure.checkbox.setAttribute('class', 'regular-checkbox');
    chartFigure.checkbox.setAttribute('id', checkboxID);
    chartFigure.checkbox.checked = true;
    
    var name = document.createTextNode(_content.name);
    chartFigure.label.appendChild(name);
    chartFigure.label.setAttribute('for', checkboxID);
	
	cbWrapper.appendChild(colorHolder);
	cbWrapper.appendChild(chartFigure.checkbox);
	cbWrapper.appendChild(chartFigure.label);
    this.chart.checkboxHolder.appendChild(cbWrapper);
    
    var elements = this.chart.checkboxHolder
						.getElementsByClassName('cbWrapp');
	var size = 0;			
	for(var i = 0; i < elements.length; i++){
		var boxBounds = elements[i].getBoundingClientRect();
		size += boxBounds.width + 30;
        }
	this.chart.checkboxHolder.style.width = size + 'px';           //TODO

    chartFigure.checkbox.addEventListener('click', function(){
        if (this.checked) {
            
            for (var i = 0; i < chartFigure.circles.length; i++) {
               chartFigure.circles[i].circle.style.display = 'inline-block';
            }
            chartFigure.chartLine.style.display = 'inline-block';
			chartFigure.averageLine.style.display = 'inline-block';
            
        }else{
            for (i = 0; i < chartFigure.circles.length; i++) {
               chartFigure.circles[i].circle.style.display = 'none';
            }
            chartFigure.chartLine.style.display = 'none';
			chartFigure.averageLine.style.display = 'none';
        }
    }, true);
    
    //Creating circles - They should be on top of the line
	var radius = 6;
    for (var i = 0; i < pointsX.length; i++) {
        
        chartFigure.circles[i] = {
            value : _content.values[i],
			info : _content.infos[i],
            circle : document.createElementNS(gako.utility.w3spec, 'circle')
        };
        
        chartFigure.circles[i].circle.setAttribute('cx', pointsX[i]);
        chartFigure.circles[i].circle.setAttribute('cy', pointsY[i]);
        chartFigure.circles[i].circle.setAttribute('r', radius);
        chartFigure.circles[i].circle.setAttribute('stroke-width', 1);
        chartFigure.circles[i].circle.setAttribute('fill','white');
        chartFigure.circles[i].circle.setAttribute('stroke',chartFigure.color);
        nodeFragment.appendChild(chartFigure.circles[i].circle);
		
		//
		// Need to be in method
		//
		var animate = document.createElementNS(gako.utility.w3spec, 'animate');
		animate.setAttribute('attributeType', 'XML');
		animate.setAttribute('attributeName', 'r');
		animate.setAttribute('from', '10');
		animate.setAttribute('to', '4');
		animate.setAttribute('dur', '1s');
		chartFigure.circles[i].circle.appendChild(animate);

        var toolTip = this.toolTip,
			infoLine = this.infoLine,
			chartHeight = this.chartHeight,
			descriptionIsShown = this.descriptionIsShown,
			placeHolder = this.placeHolder,
			descriptionHolder = this.descriptionHolder,
			chart = this.chart;

        /*
        
        
        
        All this code should be putted outside in the class !!!!!!!!!!
        
        
        
        
        */

		//Circles Events		
        chartFigure.circles[i].circle.addEventListener('mouseover', function(){
            
				var position = gako.utility.getElementTopLeft(this);
                
                this.setAttribute('fill', chartFigure.color);
                toolTip.style.display = 'block';
                toolTip.style.top = (position.top - 40) + 'px';
                toolTip.style.left = position.left + 'px';

				//Creates tool tips with the value
                for(var i = 0; i < chartFigure.circles.length; i++){
                    if (chartFigure.circles[i].circle === this) {
                        toolTip.innerHTML = chartFigure.circles[i].value;
                        break;
                    }
                }
        }, true);
        
        chartFigure.circles[i].circle.addEventListener('mouseout', function(){
            toolTip.style.display = 'none';
			this.setAttribute('fill', 'white');
        }, true);
		
		var detailsBox = this.detailsBox;
	chartFigure.circles[i].circle.addEventListener('click', function(){

        // Making them overlap on click !!! 
        var circlesHolder = this.parentNode,
            circlesHolderParent = circlesHolder.parentNode;       
        circlesHolderParent.removeChild(circlesHolder);
        circlesHolderParent.appendChild(circlesHolder);
        
			//For styling
			this.setAttribute('fill', chartFigure.color);
			detailsBox.setBgColor(chartFigure.color);
			
			var value, info, description;
			for(var i in chartFigure.circles){
                if (chartFigure.circles[i].circle === this) {
                    value = chartFigure.circles[i].value;
					info = chartFigure.circles[i].info;
					description = _content.description;
                    break;
                }
            }
			
			if(!detailsBox.isDisplayed){
				detailsBox.show();
			}

			//To be extandable its passed by object
			detailsBox.setDescription({
				value : value, 
				info : info, 
				description : description
			});

			var circlePosition = gako.utility.getElementTopLeft(this);
			
			
			detailsBox.setCoordinates(circlePosition.left, circlePosition.top);
			//detailsBox.setCoordinates(this.offsetLeft, this.offsetTop);
		}, true);
    }

    
    g.setAttribute('class', 'chartLine');
    g.appendChild(chartFigure.chartLine);
    g.appendChild(nodeFragment);
    this.chart.svg.appendChild(g);
    
    this.charts.push(chartFigure);
    
    return this;
};
                                              
gako.graphChart.prototype[addGraph] = function(/*Array*/ content){
    
	var _content = {}; //Need to be outside of the method in class
	
	if (content instanceof Array) {
		_content = {
            name : 'Chart ' + (this.charts.length + 1),
			description : '',
            values : content,
			infos : []
        };
    }else if(typeof content == String){
        _content = JSON.parse(content);
    }else if(content instanceof Object){

		_content.values = [];
		_content.infos = [];
		_content.name = content.name;
		_content.description = content.description;
		for(var i in content.values){
			//There is value and info property
			if(content.values[i] instanceof Object){
				_content.values.push(content.values[i].value);
				_content.infos.push(content.values[i].info);
			
			}else{
				//Its only number without info
				_content.values.push(content.values[i]);
				_content.infos.push("No Info");
			}
		}
	}
	
    var padding = this.padding; 
    
    var 
        g = document.createElementNS(gako.utility.w3spec, 'g'),
        posX = padding,
        posY = 0,
        spaceX = (this.chartWidth - 2 * padding)/ (_content.values.length - 1),
        points = '',
		animatePoints = '',
        pointsX = [],
        pointsY = [];

	var chartFigure = new gako.chartFigure ({
	circles : [],
        chartLine : document.createElementNS(gako.utility.w3spec, 'polyline'),
	chartFill : document.createElementNS(gako.utility.w3spec, 'polygon'),
        color : gako.utility.generateColor(this.charts.length).color,
        checkbox : document.createElement('input'),
        label : document.createElement('label'),
	strokeWidth : 4,
	type: addGraph
    });	
		
    for (var i in _content.values){
        posY = this.chartHeight - ((_content.values[i] / this.yRange) * (this.stripesPadding)) - padding;
        points += ' ' + posX + ',' + posY;
		animatePoints += ' ' + posX + ',' + (this.chartHeight - padding);
        pointsX.push(posX);
        pointsY.push(posY);
        posX += spaceX;
    }
    //chartFigure.chartLine.setAttribute('points', points);
    chartFigure.chartLine.setAttribute('fill', 'none');
    chartFigure.chartLine.setAttribute('stroke', chartFigure.color);
    chartFigure.chartLine.setAttribute('stroke-width', 2);
    
	
	
	/*
	*	Creates the checkboxes - Need to be put outside
	*/
	
	//For design prop.
	var cbWrapper = document.createElement('div');
	cbWrapper.setAttribute('class', 'cbWrapp');
	
	var colorHolder = document.createElement('div');
	colorHolder.setAttribute('class', 'checkBoxColor');
	colorHolder.setAttribute('name', _content.name);
	colorHolder.style.backgroundColor = chartFigure.color;
	
    var checkboxID = gako.utility.generateID();
    chartFigure.checkbox.setAttribute('type', 'checkbox');
    chartFigure.checkbox.setAttribute('class', 'regular-checkbox');
    chartFigure.checkbox.setAttribute('id', checkboxID);
    chartFigure.checkbox.checked = true;
    
    var name = document.createTextNode(_content.name);
    chartFigure.label.appendChild(name);
    chartFigure.label.setAttribute('for', checkboxID);
	
	cbWrapper.appendChild(colorHolder);
	cbWrapper.appendChild(chartFigure.checkbox);
	cbWrapper.appendChild(chartFigure.label);
    this.chart.checkboxHolder.appendChild(cbWrapper);
	
	var elements = this.chart.checkboxHolder
						.getElementsByClassName('cbWrapp');
	var size = 0;			
	for(var i = 0; i < elements.length; i++){
		var boxBounds = elements[i].getBoundingClientRect();
		size += boxBounds.width + 30;
	}

	this.chart.checkboxHolder.style.width = size + 'px';         //TODO

	chartFigure.checkbox.addEventListener('click', function(){
        if (this.checked) {
            
            chartFigure.chartLine.style.display = 'inline-block';
			chartFigure.chartFill.style.display = 'inline-block';
            
        }else{

            chartFigure.chartLine.style.display = 'none';
			chartFigure.chartFill.style.display = 'none';
        }
    }, true);
	
    //
	// Need to be in method
	//
	var animate = document.createElementNS(gako.utility.w3spec, 'animate');
	animate.setAttribute('attributeType', 'XML');
	animate.setAttribute('attributeName', 'points');
	animate.setAttribute('from', animatePoints);
	animate.setAttribute('to', points);
	animate.setAttribute('dur', '1s');
	chartFigure.chartLine.appendChild(animate);
	
    //Creating opacity Area - They should be on the bootom of the line
    points = '';
    for (var i = 0; i < pointsX.length; i++) {
        points += ' ' + pointsX[i] + ',' + pointsY[i];
    }
    
    //(x,0)
    points += ' ' + pointsX[pointsX.length - 1] + ',' + (this.chartHeight - padding);
    //(0,0)
    points += ' ' + padding + ',' + (this.chartHeight - padding);
    
    chartFigure.chartFill.setAttribute('points', points);
    chartFigure.chartFill.setAttribute('fill', chartFigure.color);
    chartFigure.chartFill.setAttribute('opacity', 0.5);
	var animate = document.createElementNS(gako.utility.w3spec, 'animate');
	animate.setAttribute('attributeType', 'XML');
	animate.setAttribute('attributeName', 'points');
	animate.setAttribute('from', animatePoints);
	animate.setAttribute('to', points);
	animate.setAttribute('dur', '2s');
    chartFigure.chartFill.appendChild(animate);
    g.setAttribute('class', 'chartLine');
    
    g.appendChild(chartFigure.chartFill);
    g.appendChild(chartFigure.chartLine);
    this.chart.svg.appendChild(g);
    
	var nodeFragment = document.createDocumentFragment();
	for (var i = 0; i < pointsX.length; i++) {

        chartFigure.circles[i] = {
            value : _content.values[i],
			info : _content.infos[i],
			circle : document.createElementNS(gako.utility.w3spec, 'circle')
        };
        
        chartFigure.circles[i].circle.setAttribute('cx', pointsX[i]);
        chartFigure.circles[i].circle.setAttribute('cy', pointsY[i]);
        chartFigure.circles[i].circle.setAttribute('r', '6');
        chartFigure.circles[i].circle.setAttribute('stroke-width', 1);
        chartFigure.circles[i].circle.setAttribute('fill', 'transparent');
        chartFigure.circles[i].circle.setAttribute('stroke', 'none');
        nodeFragment.appendChild(chartFigure.circles[i].circle);

        var toolTip = this.toolTip,
			infoLine = this.infoLine,
			chartHeight = this.chartHeight,
			descriptionIsShown = this.descriptionIsShown,
			placeHolder = this.placeHolder,
			descriptionHolder = this.descriptionHolder,
			chart = this.chart;
			
		//Circles Events		
        chartFigure.circles[i].circle.addEventListener('mouseover', function(){
            
				var position = gako.utility.getElementTopLeft(this);
                toolTip.style.display = 'block';
                toolTip.style.top = (position.top - 40) + 'px';
                toolTip.style.left = position.left + 'px';

				//Creates tool tips with the value
                for(var i = 0; i < chartFigure.circles.length; i++){
                    if (chartFigure.circles[i].circle === this) {
                        toolTip.innerHTML = chartFigure.circles[i].value;
                        break;
                    }
                }
        }, true);
        
        chartFigure.circles[i].circle.addEventListener('mouseout', function(){
            toolTip.style.display = 'none';
        }, true);
		
		var detailsBox = this.detailsBox;
		chartFigure.circles[i].circle.addEventListener('click', function(){
			
                        // Making them overlap on click !!! 
        var circlesHolder = this.parentNode,
            circlesHolderParent = circlesHolder.parentNode;       
        circlesHolderParent.removeChild(circlesHolder);
        circlesHolderParent.appendChild(circlesHolder);
                        
                        detailsBox.setBgColor(chartFigure.color);
			
			var value, info, description;
			for(var i in chartFigure.circles){
                if (chartFigure.circles[i].circle === this) {
                    value = chartFigure.circles[i].value;
					info = chartFigure.circles[i].info;
					description = _content.description;
                    break;
                }
            }
			
			if(!detailsBox.isDisplayed){
				detailsBox.show();
			}

			//To be extandable its passed by object
			detailsBox.setDescription({
				value : value, 
				info : info, 
				description : description
			});

			var circlePosition = gako.utility.getElementTopLeft(this);
			detailsBox.setCoordinates(circlePosition.left, circlePosition.top);
			//detailsBox.setCoordinates(this.offsetLeft, this.offsetTop);
		}, true);
    }
	
	g.setAttribute('class', 'chartLine');
    g.appendChild(chartFigure.chartLine);
    g.appendChild(nodeFragment);
    this.chart.svg.appendChild(g);
	
	this.charts.push(chartFigure);
	
    return this;
};

gako.graphChart.prototype.build = function () { }

gako.graphChart.prototype.buildInFullScreen = function () {
	
	//This is for zoom to full screen - need to be put in other method
    var fullScreen = document.createElement('div');
    fullScreen.setAttribute('Id', 'Full-Screen');
    document.body.appendChild(fullScreen);
    
    // To Put in method
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
    screenHeight = w.innerHeight || e.clientHeight || g.clientHeight;

    fullScreen.style.height = screenWidth + 'px';
    document.body.style.overflowY = 'hidden';

	var title = this.title;
    var fullScreenChart = new gako.graphChart({
        placeHolder: 'Full-Screen',
        title: title,
        width: screenWidth,
        height: screenHeight - 60,
        addAxisX: true,
        addAxisY: true,
        yRange: 50,
        drawAverage: true
    });
	
	

	var zoomoutButton = document.createElement('div');
    zoomoutButton.setAttribute('Id', 'Zoomout-Button');
    zoomoutButton.setAttribute('class', 'zoomout-button');
    zoomoutButton.addEventListener('click', function () {
        fullScreen.parentNode.removeChild(fullScreen);
        document.body.style.overflowY = 'scroll';
    }, false);
	
	//Insert the Zoom Out Button insted ot the Zoom In Button
	var zoomButton = fullScreen.getElementsByClassName('zoom-button')[0];
	zoomButton.parentNode.appendChild(zoomoutButton);
	zoomButton.parentNode.removeChild(zoomButton);

	for(var i = 0; i < this.charts.length; i++){
		var values = [];
		for(var j = 0; j < this.charts[i].circles.length; j++){
			values.push(this.charts[i].circles[j].value)
		}
		
		//need to be called vie call method!!
		if(this.charts[i].type == addCircleLine)
			fullScreenChart.addCircleLine(values)
		else if(this.charts[i].type == addGraph)
			fullScreenChart.addGraph(values)
	}
    
}

gako.graphChart.prototype.buildInOtherHolder = function (/* WebElement*/ holder) {
    
}

gako.utility = function (params) {

    var w3spec = 'http://www.w3.org/2000/svg',
        padding = 40,
        axisMark = 6;

    /* chartObject param refers to the instance of the chart class - pass 'this' 
    */
    var createChart = function (chartObject) {
        var holder = chartObject.placeHolder,
            svg = document.createElementNS(w3spec, 'svg');

        var className = holder.getAttribute('class');
        if (className != null) {
            className += ' placeHolder';
        } else {
            className = 'placeHolder';
        }

        holder.setAttribute('class', className)

        svg.setAttribute('xmlns', w3spec);
        svg.setAttribute('version', '1.2');
        svg.setAttribute('height', chartObject.chartHeight);
        svg.setAttribute('width', chartObject.chartWidth);
        holder.appendChild(svg);

        var checkboxHolder = document.createElement('div');

        checkboxHolder.setAttribute('class', 'checkbox-holder');

        var fullScreenButton = document.createElement('div');
        fullScreenButton.setAttribute('class', 'zoom-button');
        fullScreenButton.addEventListener("click", function () {
            
			chartObject.buildInFullScreen();

        }, false);

        checkboxHolder.appendChild(fullScreenButton);
        holder.appendChild(checkboxHolder);

        return {
            svg: svg,
            checkboxHolder: checkboxHolder
        };
    };

    var polarPosition = function (centerX, centerY, radius, angle) {
        var x = centerX + radius * Math.cos(angle);
        var y = centerY - radius * Math.sin(angle);
        return { x: x, y: y };
    };

    var addAxisX = function (_this, addUnits) {

        var svg = _this.chart.svg,
            height = _this.chartHeight,
            width = _this.chartWidth;

        var lineWrapp = document.createElementNS(w3spec, 'g');

        //Building the axis line
        var axis = document.createElementNS(w3spec, 'line');
        axis.setAttribute('x1', padding);
        axis.setAttribute('y1', height - padding);
        axis.setAttribute('x2', width - padding);
        axis.setAttribute('y2', height - padding);
        axis.setAttribute('stroke', 'black');

        if (addUnits) {
            var docFrag = document.createDocumentFragment();
            for (var x = padding + 50; x < (width - padding); x += 50) {
                var line = document.createElementNS(w3spec, 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', height - padding - (axisMark / 2));
                line.setAttribute('x2', x);
                line.setAttribute('y2', height - padding + (axisMark / 2));
                line.setAttribute('stroke', 'black');
                lineWrapp.appendChild(line);
            }
            lineWrapp.appendChild(docFrag);
            svg.appendChild(lineWrapp);
        }
        svg.appendChild(axis);

        return true;
    };

    var addAxisY = function (_this) {

        var svg = _this.chart.svg,
            height = _this.chartHeight,
            width = _this.chartWidth,
            maxHeight = _this.maxHeight;

        var lineWrapp = document.createElementNS(w3spec, 'g');

        //Building the axis line
        var axis = document.createElementNS(w3spec, 'line');
        axis.setAttribute('x1', padding);
        axis.setAttribute('y1', padding);
        axis.setAttribute('x2', padding);
        axis.setAttribute('y2', height - padding);
        axis.setAttribute('stroke', 'black');

        //Building the unit marks
        var maxHeight = 0,
            docFrag = document.createDocumentFragment(),
            counter = 0;
        for (var y = padding + 50; y < (height - padding); y += 50) {
            counter++;
            maxHeight += 50;
            var line = document.createElementNS(w3spec, 'line');
            line.setAttribute('x1', padding - (axisMark / 2));
            line.setAttribute('y1', height - y);
            line.setAttribute('x2', padding + (axisMark / 2));
            line.setAttribute('y2', height - y);
            line.setAttribute('stroke', 'black');
            docFrag.appendChild(line);

            var UnitNum = document.createElementNS(w3spec, 'text');
            var title = document.createTextNode(counter * _this.yRange);
            UnitNum.setAttribute('x', padding - (axisMark / 2) - 5);
            UnitNum.setAttribute('y', height - y + 5);
            UnitNum.setAttribute('fill', 'black');
            UnitNum.setAttribute("text-anchor", "end");
            //UnitNum.setAttribute('class', 'title');
            //UnitNum.innerHTML = _this.title;
            UnitNum.appendChild(title);
            _this.chart.svg.appendChild(UnitNum);

        }


        _this.stripesPadding = 50;
        _this.maxHeight = maxHeight;
        svg.appendChild(axis);
        lineWrapp.appendChild(docFrag);
        svg.appendChild(lineWrapp);
        return true;
    };

    var generateColor = function (num) {

        var colors = [
            '#646D8D',
            '#E1523D',
            '#3daf8d',
            '#FECC4E',
            '#B89F86',
            '#CEC4D7',
			'#9AA5AA'
        ];

        var color = colors[num % (colors.length - 1)],
            color2 = null;
        return { color: color, color2: color2 };
    }

    var createToolTip = function (params) {

        var placeHolder = document.getElementById(params.placeHolder),
            toolTip = document.createElement('div');

        toolTip.setAttribute('class', 'toolTip');
        toolTip.style.display = 'none';

        placeHolder.appendChild(toolTip);
        return toolTip;
    }

    var createDetailsBox = function (_this) {

        var detailsBox = {
            arrowTopPosition: 40,
            element: document.createElement('div'),
            description: document.createElement('div'),
            pointer: {
                circle: document.createElement('div'),
                line: document.createElement('div')
            },
            isDisplayed: false,
            datailsString: '<h3>Value:</h3> @value'
						+ '<h3>Information:</h3> @info'
						+ '<hr/><h3>Description:</h3> @description',

            hide: function () {
                this.element.style.display = 'none';
                this.isDisplayed = false;
            },

            show: function () {
                this.element.style.display = 'block';
                this.isDisplayed = true;
            },

            setDescription: function (obj) {
                var innerString = this.datailsString;
                for (var i in obj) {
                    try {
                        innerString = innerString.replace('@' + i, obj[i]);
                    } catch (e) {
                        console.log('No such argument : ' + obj[i]);
                    }
                }
                this.description.innerHTML = innerString;

                var boxBounds = this.description.getBoundingClientRect();
                //Need to be by the screen size
                if (boxBounds.height > 400) {
                    this.description.style.overflowY = 'scroll';
                } else {
                    this.description.style.overflowY = 'hidden';
                }
            },

            // x, y - absolute position for the point
            setCoordinates: function (x, y) {

                var lineLength = 22,
					circleD = 8,
					pointerLength = lineLength + circleD;
                var pagePadding = 20; //Need to be in consts module

                //Problem that the elemnt go and creates more of the page vertically
                var elementBottomPoint =
						y + this.element.getBoundingClientRect().height,
					pageHeight =
						document.body.getBoundingClientRect().height;

                if (elementBottomPoint > pageHeight) {
                    var y1 = y - elementBottomPoint + pageHeight - 10;
                    this.pointer.circle.style.top = (24 + elementBottomPoint - pageHeight + 9) + 'px';
                    this.pointer.line.style.top = (26 + elementBottomPoint - pageHeight + 9) + 'px';
                    this.element.style.top = y1 - 20 + 'px';
                } else {
                    this.element.style.top = y - 20 + 'px';
                    this.pointer.circle.style.top = '23px';
                    this.pointer.line.style.top = '25px';
                }


                //Problem that the elemnt go and creates more of the page horizontlly - absolute position in the page
                var elementRightPoint =
						x + this.element.getBoundingClientRect().width,
					pageWidth =
						document.body.getBoundingClientRect().width;

                if (elementRightPoint > pageWidth) {
                    this.pointer.circle.style.left = this.element.getBoundingClientRect().width + lineLength + 'px';
                    this.pointer.line.style.left = this.element.getBoundingClientRect().width + 'px';

                    //Substract the pointerLength because we add it after, add 3 because of the shadow...
                    var x1 = x - this.element.getBoundingClientRect().width - pointerLength - lineLength + 3;
                    this.element.style.left = x1 + pointerLength + 'px';
                } else {
                    this.pointer.circle.style.left = '-27px';
                    this.pointer.line.style.left = '-22px';
                    this.element.style.left = x + pointerLength + 'px';
                }

                //this.pointer.circle.setAttribute('cy', cy);

                //this.pointer.line.setAttribute('x1', cx);
                //this.pointer.line.setAttribute('y1', cy);
                //this.pointer.line.setAttribute('x2', cx + pointerLength);
                //this.pointer.line.setAttribute('y2', cy);
            },

            setBgColor: function (color) {
                this.element.style.backgroundColor = color;
                this.pointer.circle.setAttribute('fill', color);
            }
        }

        //hides the box for the first time
        detailsBox.hide();

        var descriptionTextNode = document.createTextNode(detailsBox.datailsString),
			closeButton = document.createElement('div');

        detailsBox.element.setAttribute('data-arrow-top', detailsBox.arrowTopPosition + 'px')
        detailsBox.element.appendChild(closeButton);
        detailsBox.element.appendChild(detailsBox.description);
        detailsBox.element.setAttribute('class', 'description-holder');
        closeButton.setAttribute('class', 'close-Button');
        detailsBox.description.setAttribute('class', 'description');
        detailsBox.description.appendChild(descriptionTextNode);
        _this.placeHolder.appendChild(detailsBox.element);

        detailsBox.pointer.circle.setAttribute('class', 'Pointer-Circle');
        detailsBox.element.appendChild(detailsBox.pointer.circle);

        detailsBox.pointer.line.setAttribute('class', 'Pointer-Line');
        detailsBox.element.appendChild(detailsBox.pointer.line);

        (function () { //Event Handlers for the description holder
            closeButton.addEventListener('click', function () {
                detailsBox.hide();
            }, true)
            /*
            var buttonDown = false;
            windowOptions.addEventListener('mousedown',function(event){
            buttonDown = true;
            }, true);
			
            windowOptions.addEventListener('mouseup',function(event){
            buttonDown = false;
            }, true);
			
            windowOptions.addEventListener('mousemove',function(event){
            if(!buttonDown){
            return;
            }
				
            var element;
            if(this.getBoundingClientRect){ //Need to be put outside in method
            element = this.getBoundingClientRect();
            }
				
            var mousePos = {
            x: event.clientX,
            y: event.clientY
            };
				
            //Need to be checked
            var inLeft = Math.abs(mousePos.x - element.width),
            inTop = Math.abs(mousePos.y - element.height);
				
            detailsBox.element.style.left = mousePos.x + document.body.scrollLeft - 10 + 'px';
            detailsBox.element.style.top = mousePos.y + document.body.scrollTop - 10 + 'px';
            },true);
            */
        })();

        return detailsBox;
    }

    var createInfoLine = function (params) {

        var placeHolder = document.getElementById(params.placeHolder),
            infoLine = document.createElementNS(gako.utility.w3spec, 'line');

        infoLine.setAttribute('class', 'InfoLine');
        infoLine.setAttribute('stroke', 'none');
        placeHolder.getElementsByTagName('svg')[0].appendChild(infoLine);
        return infoLine;
    }

    var getElementTopLeft = function (ele) {
        if (ele.getBoundingClientRect) {

            //Problem with scroll on firefox - This peace of code should be put outside in method
            var viewportElement, sUsrAg = navigator.userAgent;
            if (sUsrAg.indexOf("Firefox") > -1) {
                viewportElement = document.documentElement;
            } else {
                viewportElement = document.body;
            }

            var box = ele.getBoundingClientRect(),
			scrollLeft = viewportElement.scrollLeft,
			scrollTop = viewportElement.scrollTop;

            var left = box.left + scrollLeft,
				top = box.top + scrollTop;

            return { top: top, left: left };
        }

        return {}
    }

    var addTitle = function (_this) {
        var text = document.createElementNS(w3spec, 'text');
        var title = document.createTextNode(_this.title);
        text.setAttribute('x', _this.chartWidth / 2);
        text.setAttribute('y', '30');
        text.setAttribute('fill', 'black');
        text.setAttribute("text-anchor", "middle");
        text.setAttribute('class', 'title');
        text.innerHTML = _this.title;
        text.appendChild(title);
        _this.chart.svg.appendChild(text);
    }

    var generateID = function () {
        var S4 = function () {
            return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
        };

        return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
    }

    return {
        w3spec: w3spec,
        padding: padding,
        createChart: createChart,
        polarPosition: polarPosition,
        addAxisX: addAxisX,
        addAxisY: addAxisY,
        generateColor: generateColor,
        createToolTip: createToolTip,
        createDetailsBox: createDetailsBox,
        createInfoLine: createInfoLine,
        getElementTopLeft: getElementTopLeft,
        addTitle: addTitle,
        generateID: generateID
    };

} ();