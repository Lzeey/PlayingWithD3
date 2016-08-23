//Input variables
var dataPath = 'data/DataDay0.csv';
var setToPlot = 1; //TODO: SWITCH between XY sets based on input
var xName = 'x2';
var yName = 'y2';

var margin = {top:20, right:30, bottom: 30, left:40};

// Some display attributes ------------------
dot_radius = 5; //Change this if scatter plots are too big/small
scaleFactor = 1.1; //Gives some breathing space at the edge

// END display attr -------------------------
//TODO: Derive from SVG box
var width = 900 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

//END OF INPUT------------

var yScale = d3.scaleLinear().range([0,height]), //Not inverting here
    xScale = d3.scaleLinear().range([0,width]);

//Replace with input SVG box
var svg = d3.select("#scatter")
    .append('svg')
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom)
    .style('stroke','gray');

var scatterCanvas = svg
    .append('g')
    .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

var parseRow = function(d){
    return {x1:+d.x1,y1:+d.y1,
            x2:+d.x2,y2:+d.y2,
            x3:+d.x3,y3:+d.y3,
           name:d.username};
};

var div = d3.select('body').append('div')
    .attr('class','tooltipdiv')
    .style("opacity", 0);

var fisheye = d3.fisheye.circular().radius(50).distortion(3);

//This portion runs only after data has finished loading
d3.tsv(dataPath, parseRow, function(error, data) {
    var xExtent = d3.extent(data,function(d){return d[xName]}).map(function(d){return d*scaleFactor}),
        yExtent = d3.extent(data,function(d){return d[yName]}).map(function(d){return d*scaleFactor}); //to ensure a bit of extra space
    //Insert the extent, which is a [min,max] array
    xScale.domain(xExtent);
    yScale.domain(yExtent);
    
    var dots = scatterCanvas.selectAll()
            .data(data)
            .enter().append('g')
            .append('circle')
            .attr('r',dot_radius)
            .attr('cx', function(d){return xScale(d[xName])})
            .attr('cy', function(d){return yScale(d[yName])})
            .on('mouseover', mouseOverHandle)
            .on('mouseout',mouseOutHandle);      
    //Fish eye here
    svg.on('mousemove', function() {
        fisheye.focus(mouseTranslate(d3.mouse(this)));
        dots.each(function(d) { d.fisheye = fisheye({x:xScale(d[xName]),y:yScale(d[yName])}); })
            .attr("cx", function(d) { return (d.fisheye.x); })
            .attr("cy", function(d) { return (d.fisheye.y); })
            .attr("r", function(d) { return d.fisheye.z * dot_radius; });
    })
    
    /*
    //Plot axes
    var xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale).ticks(10,'%');
    
    chart.append('g')
        .attr('class','x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    
    chart.append('g')
        .attr('class','y axis')
        .call(yAxis);*/
});

// For the offset in fisheye effect
mouseTranslate = function(d) {return [d[0]-margin.left, d[1]-margin.top]}

//Define mouseover events here for tooltips
mouseOverHandle = function(d) {
    div.transition()
    .duration(200)
    .style('opacity',0.9);
    div.html(sprintf('ID: %s<br/>x: %.2f<br/>y: %.2f',d.name,d[xName],d[yName]))
    .style('left', d3.event.pageX + 'px')
    .style('top', (d3.event.pageY - 28) + 'px');
    
    d3.select(this)
    .attr('r',dot_radius*2)
    .style('fill','red');
};

mouseOutHandle = function(d) {
    div.transition()
    .duration(400)
    .style('opacity',0);
    
    d3.select(this)
    .attr('r',dot_radius)
    .style('fill','gray');
};