var margin = {top:20, right:30, bottom: 30, left:40};

var width = 900 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;
    
var y = d3.scaleLinear().range([height, 0]),
    x = d3.scaleBand().range([0,width]); //Map each letter to a band

var svg = d3.select("#alphabets")
    .append('svg')
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom);

var chart = svg
    .append('g')
    .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

var parseRow = function(d){
    return {letter:d.Letter,
           freq:(+d.Frequency)/100};
};

var div = d3.select('body').append('div').attr('class','tooltip')

//This portion runs only after after has finished loading
d3.csv('data/LetterFrequency.csv', parseRow, function(error, data) {
    y.domain([0,d3.max(data,function(d){return d.freq})]);
    x.domain(data.map(function(d){return d.letter}));
    
    var bar = chart.selectAll('g')
            .data(data)
            .enter().append('g')
            .attr('transform',function(d){return 'translate(' + x(d.letter) + ',0)';});
    
    bar.append('rect')
        .attr('width',x.bandwidth())
        .attr('y',function(d){ return y(d.freq);})
        .attr('height',function(d){ return height- y(d.freq)})
    
    //Plot axes
    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y).ticks(10,'%');
    
    chart.append('g')
        .attr('class','x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    
    chart.append('g')
        .attr('class','y axis')
        .call(yAxis);
});