'use strict';
var gako = gako || {};


/*
   Object Models 
*/
gako.Chart = function(params){
    this.placeHolder = document.getElementById(params.placeHolder);
    this.chartWidth = params.width;
    this.chartHeight = params.height;
    this.title = params.title;
    this.chart = gako.utility.createChart(this, params.chartType);
    this.yRange = params.yRange;
    this.addAxisX = params.addAxisX;
    this.addAxisY = params.addAxisY;
    this.zeroPosition = 0;
    this.padding = 40;
    this.toolTip = gako.utility.createToolTip(params);
    this.infoLine = gako.utility.createInfoLine(params);
    this.detailsBox = gako.utility.createDetailsBox(this);
    this.charts = [];
}

gako.ChartFigure = function (params){
    this.type = params.type;
    this.circles = params.circles;
    this.chartLine = params.chartLine;
    this.chartFill = params.chartFill;
    this.color = params.color;
    this.checkbox = params.checkbox;
    this.label = params.label;
    this.averageLine = params.averageLine;
    this.strokeWidth = params.strokeWidth;
}

gako.Circle = function (params) {
    this.value = params.value;
    this.info = params.info;
    this.circle = params.circle;
    this.posX = params.posX;
    this.posY = params.posY;
}



//Names of charts methods
var addCircleLine = 'addCircleLine',
	addGraph = 'addGraph';

gako.graphChart = function (params) {

    //Public
    this.placeHolder = document.getElementById(params.placeHolder);
    this.chartWidth = params.width;
    this.chartHeight = params.height;
    this.title = params.title;
    this.chart = gako.utility.createChart(this);
    this.yRange = params.yRange;
    this.addAxisX = params.addAxisX;
    this.addAxisY = params.addAxisY;
    this.zeroPosition = 0;
    this.padding = 40;
    this.toolTip = gako.utility.createToolTip(params);
    this.infoLine = gako.utility.createInfoLine(params);
    this.detailsBox = gako.utility.createDetailsBox(this);
    this.valueLabels = params.valueLabels;
    this.charts = [];

    //Private
    this.maxHeight = params.maxHeight; // In Use
    this.stripesPadding = 50; // In Use
    

    //Need to be set up as div
    if (params.hasOwnProperty('title')) {
        gako.utility.addTitle(this);
    }
};

gako.graphChart.prototype[addCircleLine] = function (/* JSON, obj, array */content, /* boolean */showAverage) {

    var _content = {}; //Need to be outside of the method in class
    if (content instanceof Array) {
        _content = {
            name: 'Chart ' + (this.charts.length + 1),
            description: '',
            values: content,
            infos: []
        };
    } else if (typeof content == String) {
        _content = JSON.parse(content);
    } else if (content instanceof Object) {

        if (content.hasOwnProperty('detailsContentString')) {
            if (content.detailsContentString !== null && content.detailsContentString !== undefined) {
                _content.detailsContentString = content.detailsContentString;
            }
        }

        if (content.hasOwnProperty('description')) {
            if (content.description !== null && content.description !== undefined) {
                _content.description = content.description;
            }
        }

        if (content.hasOwnProperty('name')) {
            if (content.name !== null && content.name !== undefined) {
                _content.name = content.name;
            }
        }

        if (content.hasOwnProperty('customInfo')) {
            if (content.customInfo !== null && content.customInfo !== undefined) {
                _content.customInfo = [];
                for (var i in content.customInfo) {
                    _content.customInfo.push({
                        param: i,
                        value: content.customInfo[i]
                    });
                }
            }
        }

        if (!content.hasOwnProperty('values')) {
            throw new Error('The Property values is required!');
        }

        _content.values = [];
        _content.infos = [];

        for (var i in content.values) {
            //There is value and info property
            if (content.values[i] instanceof Object) {
                _content.values.push(content.values[i].value);
                _content.infos.push(content.values[i].info);

            } else {
                //Its only number without info
                _content.values.push(content.values[i]);
                _content.infos.push("No Info");
            }
        }
    }

    var chartFigure = new gako.ChartFigure({
        circles: [],
        chartLine: document.createElementNS(gako.utility.w3spec, 'polyline'),
        color: gako.utility.generateColor(this.charts.length).color,
        checkbox: document.createElement('input'),
        label: document.createElement('label'),
        averageLine: document.createElementNS(gako.utility.w3spec, 'line'), // Need to be deleted
        strokeWidth: 4,
        type: addCircleLine
    });

    var g = document.createElementNS(gako.utility.w3spec, 'g'),
        nodeFragment = document.createDocumentFragment(),
        padding = this.padding,
        posX = padding,
        posY = 0,
        spaceX = (this.chartWidth - 2 * padding) / (_content.values.length - 1),
        points = '',
        pointsX = [],
        pointsY = [];

    var totalContentSum = 0;
    for (var i in _content.values) {
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
    for (var i = 0; i < elements.length; i++) {
        var boxBounds = elements[i].getBoundingClientRect();
        size += boxBounds.width + 30;
    }
    this.chart.checkboxHolder.style.width = size + 'px';           //TODO

    chartFigure.checkbox.addEventListener('click', function () {
        if (this.checked) {

            for (var i = 0; i < chartFigure.circles.length; i++) {
                chartFigure.circles[i].circle.style.display = 'inline-block';
            }
            chartFigure.chartLine.style.display = 'inline-block';
            chartFigure.averageLine.style.display = 'inline-block';

        } else {
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
            value: _content.values[i],
            info: _content.infos[i],
            circle: document.createElementNS(gako.utility.w3spec, 'circle'),
            posX: pointsX[i],
            posY: pointsY[i]
        };

        chartFigure.circles[i].circle.setAttribute('cx', -10);
        chartFigure.circles[i].circle.setAttribute('cy', -10);
        chartFigure.circles[i].circle.setAttribute('r', radius);
        chartFigure.circles[i].circle.setAttribute('stroke-width', 1);
        chartFigure.circles[i].circle.setAttribute('fill', 'white');
        chartFigure.circles[i].circle.setAttribute('stroke', chartFigure.color);
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
			descriptionIsShown = this.descriptionIsShown,
			placeHolder = this.placeHolder,
			descriptionHolder = this.descriptionHolder,
			chart = this.chart;

        /*
        
        
        
        All this code should be putted outside in the class !!!!!!!!!!
        
        
        
        
        */

        //Circles Events		
        chartFigure.circles[i].circle.addEventListener('mouseover', function () {

            var position = gako.utility.getAbsolutePosition(this);

            this.setAttribute('fill', chartFigure.color);
            toolTip.style.display = 'block';
            toolTip.style.top = (position.top - 40) + 'px';
            toolTip.style.left = position.left + 'px';

            //Creates tool tips with the value
            for (var i = 0; i < chartFigure.circles.length; i++) {
                if (chartFigure.circles[i].circle === this) {
                    toolTip.innerHTML = chartFigure.circles[i].value;
                    break;
                }
            }
        }, true);

        chartFigure.circles[i].circle.addEventListener('mouseout', function () {
            toolTip.style.display = 'none';
            this.setAttribute('fill', 'white');
        }, true);

        var detailsBox = this.detailsBox;
        chartFigure.circles[i].circle.addEventListener('click', function () {

            // Making them overlap on click !!! 
            var circlesHolder = this.parentNode,
            circlesHolderParent = circlesHolder.parentNode;
            circlesHolderParent.removeChild(circlesHolder);
            circlesHolderParent.appendChild(circlesHolder);

            //For styling
            this.setAttribute('fill', chartFigure.color);
            detailsBox.setBgColor(chartFigure.color);

            var value, info;
            for (var i in chartFigure.circles) {
                if (chartFigure.circles[i].circle === this) {
                    value = chartFigure.circles[i].value;
                    info = chartFigure.circles[i].info;
                    break;
                }
            }

            if (!detailsBox.isDisplayed) {
                detailsBox.show();
            }

            if (_content.detailsContentString) {
                detailsBox.setDetailsString(_content.detailsContentString);
            } else {
                detailsBox.setDefaultDetailsString();
            }

            //To be extandable its passed by object
            var params = {}
            params.value = value;
            params.info = info;
            params.description = _content.description;
            params.name = _content.name;
            for (var i in _content.customInfo) {
                params[_content.customInfo[i].param] = _content.customInfo[i].value;
            }
            detailsBox.setDescription(params);

            var circlePosition = gako.utility.getAbsolutePosition(this);


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

gako.graphChart.prototype[addGraph] = function (/*Array*/content) {

    var _content = {}; //Need to be outside of the method in class

    if (content instanceof Array) {
        _content = {
            name: 'Chart ' + (this.charts.length + 1),
            description: '',
            values: content,
            infos: []
        };
    } else if (typeof content == String) {
        _content = JSON.parse(content);
    } else if (content instanceof Object) {

        if (content.hasOwnProperty('detailsContentString')) {
            if (content.detailsContentString !== null && content.detailsContentString !== undefined) {
                _content.detailsContentString = content.detailsContentString;
            }
        }

        if (content.hasOwnProperty('description')) {
            if (content.description !== null && content.description !== undefined) {
                _content.description = content.description;
            }
        }

        if (content.hasOwnProperty('name')) {
            if (content.name !== null && content.name !== undefined) {
                _content.name = content.name;
            }
        }

        if (content.hasOwnProperty('customInfo')) {
            if (content.customInfo !== null && content.customInfo !== undefined) {
                _content.customInfo = [];
                for (var i in content.customInfo) {
                    _content.customInfo.push({
                        param: i,
                        value: content.customInfo[i]
                    });
                }
            }
        }

        if (!content.hasOwnProperty('values')) {
            throw new Error('The Property values is required!');
        }

        _content.values = [];
        _content.infos = [];

        for (var i in content.values) {
            //There is value and info property
            if (content.values[i] instanceof Object) {
                _content.values.push(content.values[i].value);
                _content.infos.push(content.values[i].info);

            } else {
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
        spaceX = (this.chartWidth - 2 * padding) / (_content.values.length - 1),
        points = '',
		animatePoints = '',
        pointsX = [], // Need to be modify to points[i].x points[i].y
        pointsY = [];

    var chartFigure = new gako.ChartFigure({
        circles: [],
        chartLine: document.createElementNS(gako.utility.w3spec, 'polyline'),
        chartFill: document.createElementNS(gako.utility.w3spec, 'polygon'),
        color: gako.utility.generateColor(this.charts.length).color,
        checkbox: document.createElement('input'),
        label: document.createElement('label'),
        strokeWidth: 4,
        type: addGraph
    });

    for (var i in _content.values) {
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
    chartFigure.chartLine.setAttribute('stroke-width', 0);



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
    for (var i = 0; i < elements.length; i++) {
        var boxBounds = elements[i].getBoundingClientRect();
        size += boxBounds.width + 30;
    }

    this.chart.checkboxHolder.style.width = size + 'px';         //TODO

    chartFigure.checkbox.addEventListener('click', function () {
        if (this.checked) {

            chartFigure.chartLine.style.display = 'inline-block';
            chartFigure.chartFill.style.display = 'inline-block';

        } else {

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
            value: _content.values[i],
            info: _content.infos[i],
            circle: document.createElementNS(gako.utility.w3spec, 'circle'),
            posX: pointsX[i],
            posY: pointsY[i]
        };

        chartFigure.circles[i].circle.setAttribute('cx', -10);
        chartFigure.circles[i].circle.setAttribute('cy', -10);
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
        chartFigure.circles[i].circle.addEventListener('mouseover', function () {

            // Need to be in the tool tip method and just call the show() method!!!!!!!!!!!!!!!
            var position = gako.utility.getAbsolutePosition(this);
            toolTip.style.display = 'block';
            toolTip.style.top = (position.top - 40) + 'px';
            toolTip.style.left = position.left + 'px';

            //Creates tool tips with the value
            for (var i = 0; i < chartFigure.circles.length; i++) {
                if (chartFigure.circles[i].circle === this) {
                    toolTip.innerHTML = chartFigure.circles[i].value;
                    break;
                }
            }
        }, true);

        chartFigure.circles[i].circle.addEventListener('mouseout', function () {
            toolTip.style.display = 'none';
        }, true);

        var detailsBox = this.detailsBox;
        chartFigure.circles[i].circle.addEventListener('click', function () {

            // Making them overlap on click !!! 
            var circlesHolder = this.parentNode,
            circlesHolderParent = circlesHolder.parentNode;
            circlesHolderParent.removeChild(circlesHolder);
            circlesHolderParent.appendChild(circlesHolder);

            detailsBox.setBgColor(chartFigure.color);

            var value, info;
            for (var i in chartFigure.circles) {
                if (chartFigure.circles[i].circle === this) {
                    value = chartFigure.circles[i].value;
                    info = chartFigure.circles[i].info;
                    break;
                }
            }

            if (!detailsBox.isDisplayed) {
                detailsBox.show();
            }

            if (_content.detailsContentString) {
                detailsBox.setDetailsString(_content.detailsContentString);
            } else {
                detailsBox.setDefaultDetailsString();
            }

            //To be extandable its passed by object
            var params = {}
            params.value = value;
            params.info = info;
            params.description = _content.description;
            params.name = _content.name;
            for (var i in _content.customInfo) {
                params[_content.customInfo[i].param] = _content.customInfo[i].value;
            }
            detailsBox.setDescription(params);

            var circlePosition = gako.utility.getAbsolutePosition(this);
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

gako.graphChart.prototype.build = function () {

    //To be Modify
    var maxValue = 0,
        minValue = 0,
        hasNegative = false,
        hasPositive = false;
    for (var i in this.charts) {
        for (var j in this.charts[i].circles) {
            if (this.charts[i].circles[j].value < minValue) {
                minValue = this.charts[i].circles[j].value;
            }
            if (this.charts[i].circles[j].value > maxValue) {
                maxValue = this.charts[i].circles[j].value;
            }
            if (this.charts[i].circles[j].value < 0) {
                hasNegative = true;
            }
            if (this.charts[i].circles[j].value > 0) {
                hasPositive = true;
            }
        }
    }

    if (this.addAxisX) {
        gako.utility.addAxisX(this);
    }

    if (this.addAxisY) {
        gako.utility.addAxisY(this, minValue);
    }

    var positionByZero = 0;
    if (hasNegative) {
        //Position of the zeroo !!!!!!!!!!!!!!!!!!!
        this.zeroPosition = this.chartHeight - ((maxValue / this.yRange) * (this.stripesPadding)) + this.stripesPadding;
        positionByZero = -this.chartHeight + this.zeroPosition;
    }

    if (hasNegative && !hasPositive) {
        //TODO
    }

    for (var i = 0; i < this.charts.length; i++) {
        var points = '';
        for (var j = 0; j < this.charts[i].circles.length; j++) {
            //Setting the position of the circles
            //This is changed in two places! Should be corrected !!!!!!
            var circlePosY,
                circlePosX = this.charts[i].circles[j].posX;
            if (true) {
                circlePosY = this.charts[i].circles[j].posY + positionByZero;
            }
            this.charts[i].circles[j].circle.setAttribute('cx', circlePosX);
            this.charts[i].circles[j].circle.setAttribute('cy', circlePosY);

            //Setting the position of the line
            points += ' ' + circlePosX + ',' + circlePosY;
        }
        this.charts[i].chartLine.setAttribute('points', points);

    }
}

gako.graphChart.prototype.buildInFullScreen = function () {
    var strWindowFeatures = "status=no" //"menubar=no,location=no,resizable=no,scrollbars=no,status=yes,close=no"
    //var newWindow = open(null, "Testing New Title", strWindowFeatures)
    //newWindow.document.write('test');

    //This is for zoom to full screen - need to be put in other method
    var fullScreen = document.createElement('div');
    fullScreen.setAttribute('Id', 'Full-Screen');
    //newWindow.document.body.appendChild(fullScreen);


    // To Put in method
    var w = newWindow,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
    screenHeight = w.innerHeight || e.clientHeight || g.clientHeight;

    fullScreen.style.height = screenWidth + 'px';
    newWindow.document.body.style.overflowY = 'hidden';

    window = newWindow;

    var title = this.title;
    var fullScreenChart = new gako.graphChart({
        placeHolder: 'Full-Screen',
        title: title,
        width: screenWidth,
        height: screenHeight - 60,
        addAxisX: true,
        addAxisY: true,
        yRange: 50,
        window : newWindow,
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

    for (var i = 0; i < this.charts.length; i++) {
        var values = [];
        for (var j = 0; j < this.charts[i].circles.length; j++) {
            values.push(this.charts[i].circles[j].value)
        }

        //fullScreenChart[this.charts[i].type].call(this, values);
        //need to be called vie call method!!
        if (this.charts[i].type == addCircleLine)
            fullScreenChart.addCircleLine(values)
        else if (this.charts[i].type == addGraph)
            fullScreenChart.addGraph(values)
    }

    fullScreenChart.build();

}

gako.utility = function (params) {

    var w3spec = 'http://www.w3.org/2000/svg',
        padding = 40,
        axisMark = 6;

    /* chartObject param refers to the instance of the chart class - pass 'this' 
    */
    var createChart = function (chartObject) {

        var holder = chartObject.placeHolder,
            title = document.createElement('h2'),
            svg = document.createElementNS(w3spec, 'svg');

        var className = holder.getAttribute('class');
        if (className != null) {
            className += ' placeHolder';
        } else {
            className = 'placeHolder';
        }

        holder.setAttribute('class', className)

        //Setting The title
        title.setAttribute('class', 'title');
        holder.appendChild(title);

        //Setting The SVG holder
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

        //checkboxHolder.appendChild(fullScreenButton);
        holder.appendChild(checkboxHolder);

        return {
            title: title,
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

        }
        svg.appendChild(axis);

        return true;
    };

    var addAxisY = function (_this, startValue) {

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
        _this.stripesPadding = 50; // There is a bug when the content is  bigger than the exis - need to be dynamic - Need to be removed from here

        /* for (var y = padding + _this.stripesPadding; y < (height - padding); y += _this.stripesPadding) {
        counter++;
        maxHeight += _this.stripesPadding;
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

        }*/

        for (var y = padding + _this.stripesPadding; y < (height - padding); y += _this.stripesPadding) {
            counter++;
            maxHeight += _this.stripesPadding;
            var line = document.createElementNS(w3spec, 'line');
            line.setAttribute('x1', padding - (axisMark / 2));
            line.setAttribute('y1', height - y);
            line.setAttribute('x2', padding + (axisMark / 2));
            line.setAttribute('y2', height - y);
            line.setAttribute('stroke', 'black');
            docFrag.appendChild(line);

            var UnitNum = document.createElementNS(w3spec, 'text');
            var title = document.createTextNode(counter * _this.yRange + startValue);
            UnitNum.setAttribute('x', padding - (axisMark / 2) - 5);
            UnitNum.setAttribute('y', height - y + 5);
            UnitNum.setAttribute('fill', 'black');
            UnitNum.setAttribute("text-anchor", "end");
            UnitNum.appendChild(title);
            _this.chart.svg.appendChild(UnitNum);

        }

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


            detailsString: '',

            hide: function () {
                this.element.style.display = 'none';
                this.isDisplayed = false;
            },

            show: function () {
                this.element.style.display = 'block';
                this.isDisplayed = true;
            },

            setDetailsString: function (/* String */ newDetailsString) {
                this.detailsString = newDetailsString;
            },

            setDefaultDetailsString: function () {
                this.detailsString = '<h3>Value:</h3> @value'
						+ '<h3>Information:</h3> @info'
						+ '<h3>Description:</h3> @description';  
            },

            setDescription: function (obj) {
                var innerString = this.detailsString;
                for (var i in obj) {
                    try {
                        if (obj[i] != null && obj[i] != undefined) {
                            innerString = innerString.replace('@' + i, obj[i]);
                        }else{
                            innerString = innerString.replace('@' + i, "");
                        }
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

                // -40 fixes scrolling problem problem
                if (elementRightPoint > pageWidth - 40) {
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

        var descriptionTextNode = document.createTextNode(detailsBox.detailsString),
			closeButton = document.createElement('div'),
            descMenuWrappBox = document.createElement('div');

        detailsBox.element.setAttribute('data-arrow-top', detailsBox.arrowTopPosition + 'px')
        descMenuWrappBox.appendChild(closeButton);
        descMenuWrappBox.setAttribute('class', 'descMenuWrappBox')
        detailsBox.element.appendChild(descMenuWrappBox);
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

    var getAbsolutePosition = function (ele) {
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

    var addTitle = function (chartObj) {
        if (chartObj.title) {
            var text = document.createTextNode(chartObj.title);
            chartObj.chart.title.appendChild(text);
        }
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
        getAbsolutePosition: getAbsolutePosition,
        addTitle: addTitle,
        generateID: generateID
    };

} ();
