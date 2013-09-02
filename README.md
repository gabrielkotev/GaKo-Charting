GaKo-Charting
=============

The main purpose of the project was the creation of lightweight library which generates charts in HTML5 pages.

The library requires PURE JavaScript and it can be used with all of the popular libraries out there. 


Charting
-------------

Simply add the following line in the bottom of the HTML5 page:

```
<script src="gako.js"></script>
```
* src is filled with the path to the library


After that  create some div element with uniqe id, which will contain the chart.
For example:
```
<div id="Chart1"></div>
```
And now for the real stuff. The chart is created by calling the constructor of the graphChart class(function) in the gako namespace and creating new chart object.
```
var chart1 = new gako.graphChart({
        placeHolder : "Chart1",
        title : 'Chart Title',
        width: 700,
        height : 500,
        addAxisX : true,
        addAxisY : true,
        yRange : 100,
    }).addCircleLine( {
        name : 'figure1',
	description : 'some description about the first figure',
        values : [
				{value : 200, info : "test1"}, 
				{value : 300, info : "test2"}, 
				{value : 400, info : "test3"}, 
				345,
				345,
				{value : 500, info : "test4"}
                     ]	
    } ).addGraph( {
        name : 'figure2',
	description : 'some description about the second figure',
        values : [360, 367, 269, 400, 380, 389, 378]
    });

chart1.build(); 
```
