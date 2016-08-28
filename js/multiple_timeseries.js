// This creates multiple time-series graphs
function multiple_graphs(selection,rawData,datelist,userName){

    //Parse data into the nested form we want
    //----------------------------------------------
    var featureList = ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11']; //TODO: modify this. Shouldn't need to do this, because we already have preliminary data parsing
    var firstRun = true;
    //Takes in the raw data. Outputs an array of objects. Each object has a key (feature name), and values (used for plotting).
    //Assumption: input dates are sorted
    function transformData(rawData,datelist,user) {
        var tmpdata = rawData.slice(); //Prevent writing onto actual data
        // Append dates to the items
        tmpdata.forEach(function(c,ind_c) {
            function filterByUser(d){
                return d.username == userName;
            };
            c = c.filter(filterByUser)[0];
            if (typeof c !== 'undefined'){
                c.date = new Date(datelist[ind_c]);
                for(var i =0; i < featureList.length;i++){
                    c[featureList[i]] = +c[featureList[i]];
                };
            };
            tmpdata[ind_c] = c; //modify in-place
        });
        //Now filter the empty elements
        tmpdata = tmpdata.filter(function(d){return (typeof d !== 'undefined')})
        
        //Now extract values individually. We want an array of objects. Each object has .key (feature name), and .values, which is an object holding two arrays of n:y-axis values, and date: x-axis values
        var newData = [];
        for(var i =0; i < featureList.length;i++){
            var tmp = {};
            tmp.key = featureList[i];
            tmp.values = tmpdata.map(function(d){
                return {n: d[featureList[i]],
                       date: d.date};
            });
            newData.push(tmp);        
        };
        console.log(newData);
        return newData;
    };
        
    var data = transformData(rawData,datelist,userName);

    var width = 250,
        height = 120,
        margin = {top: 15, right: 10, bottom: 20, left: 20};
    
    //Accessor functions
    function xVal(d){return d.date};
    function yVal(d){return d.n}; //NOTE: map to n for filtering later
    
    var xScale = d3.scaleTime().range([0,width]),
        yScale = d3.scaleLinear().range([height,0]);
    
    var area = d3.area()
            .x(function(d){return xScale(xVal(d))})
            .y0(height);
            //.y1(function(d){return yScale(yVal(d))}); //This is defined within each plot
    
    var line = d3.line()
            .x(function(d){return xScale(xVal(d))});
            //.y(function(d){return yScale(yVal(d))}); //Same as above
    
    //For use later
    var circle, caption, curYear, divs, svg, g, areaPlot, linePlot;
        
    chart();
    function chart(){
        
        //Define domain for x -- uniform for all
        var extentX = d3.extent(data[0].values,function(d){return xVal(d)});
        xScale.domain(extentX);
        //The maximum of all y's. Use that as a constant buffer for domain of y. (i.e. domain([0, maxOfIndividualPlot+0.3*maxOfAllY])). This retains the sense of scale between plots.
        var maxOfAllY = d3.max(data, function(c) {return d3.max(c.values, function(d) {return yVal(d)})});
        
        //Setup inner divs to hold the plots
        divs = selection.selectAll('.timeChart')
                    .data(data);
        
        divs.exit().remove();
        
        divs.enter()
            .append('div')
            .attr('class','timeChart')
            .append('svg')
            .append('g');

        svg = divs.select('svg')
                      .attr("width", width + margin.left + margin.right )
                      .attr("height", height + margin.top + margin.bottom );

        g = divs.select('g')
                    .attr('class','bigG')
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .each(function(c){ //here we define the individual yScale for each plot
                        c.yMax = d3.max(c.values, function(d){return yVal(d)});
                        c.yScale = d3.scaleLinear().range([height,0])
                          .domain([0, c.yMax + 0.25*maxOfAllY]);
                    });
        
        //For the first run, we have to render the elements first. This is due to a difficult in updating the data directly (highly nested).
        if (firstRun){
            console.log('here');
            areaPlot = g
                .append('path')
                .attr('class','areaPlot')
                .style('pointer-events','none');
            
            linePlot = g.append('path')
                .attr('class','linePlot')
                .style('pointer-events','none');
            
            //Labels
            g.append("text")
                .attr("class", "plotTitle")
                .attr("text-anchor", "middle")
                .attr("y", 0) //put height for bottom
                .attr("dy", -margin.top/3) //margin.bottom / 2 + 5
                .attr("x", width / 2)
                .text(function(c) {return c.key});

            //actual grid    
            g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr('class','grid x')

            g.append('g')
            .attr('class','grid y')

            //axis
            g.append('g')
            .attr('class','axis x')
            .attr("transform", "translate(0," + height + ")");

            g.append('g')
            .attr('class','axis y');
           
            //Interactive element - add the circle/bar we want to see. TODO: div tooltip
            circle = g.append("circle")
              .attr('class','timeSeriesCircle')
              .attr("r", 5)
              .attr("opacity", 0)
              .style("pointer-events", "none");

            caption = g.append("text")
              .attr("class", "timeSeriesCaption")
              .attr("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("dy", -8);

            curYear = g.append("text")
              .attr("class", "timeSeriesDate")
              .attr("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("dy", 13)
              .attr("y", height);
            
            d3.selectAll('.bigG').append('rect') //This captures the mouse movement
                .attr("class", "backgroundTimeSeries")
                .style("pointer-events", "all")
                .attr("width", width + margin.right )
                .attr("height", height)
                .on('mouseover', mouseOverHandle)
                .on('mousemove', mouseMoveHandle)
                .on('mouseout', mouseOutHandle);
        }
        //END first rendering ---------------
        
        //Update data
        
        //We have to use a selection-select to force data inheritance when updating. This WILL NOT WORK if there are multiple elements (e.g. bar plot)
        d3.selectAll('.bigG').select('.areaPlot').transition().duration(700)
                .attr('d',function(c){
                return area.y1(function(d){return c.yScale(yVal(d));})
                    (c.values); //Argument for the function
        });
    
        d3.selectAll('.bigG').select('.linePlot').transition().duration(700)
                .attr('d',function(c){
                return line.y(function(d){ return c.yScale(yVal(d));})
                    (c.values)
        });
        
        //grid and axis
        var xGrid = d3.axisBottom(xScale).ticks(4).tickSize(-height).tickFormat("");
        function plotYGrid(c){ //We have to do this the round-about way, unfortunately
            grid = d3.axisLeft(c.yScale).ticks(4).tickSize(-width).tickFormat("");
            grid(d3.select(this));
        };
        
        function plotYAxis(c){
             axis = d3.axisLeft(c.yScale).ticks(4);
             axis(d3.select(this));
        };
        
        d3.selectAll('.bigG').select('.x.grid').call(xGrid);
        d3.selectAll('.bigG').select('.y.grid').each(plotYGrid);
        d3.selectAll('.bigG').select('.x.axis').call(d3.axisBottom(xScale).ticks(4));
        d3.selectAll('.bigG').select('.y.axis').each(plotYAxis);
        d3.selectAll('.bigG').select('.timeSeriesCircle');
        d3.selectAll('.bigG').select('.timeSeriesCaption'); 
        d3.selectAll('.bigG').select('.timeSeriesDate'); 
        
        return chart;
    }
    //Getter-setters here
    //----------------------
    
    chart.user = function(value){
        if (value == undefined) {return userName};
        userName = value;
        firstRun = false;
        //Update data
        data = transformData(rawData,datelist,userName);
        chart();
    }
    
    
    //END getter-setter-----
    
    //Mouse events here
    //----------------------
    function mouseOverHandle(){
        circle.transition().duration(200).attr('opacity',1);
        caption.transition().duration(200).attr('opacity',1);
        curYear.transition().duration(200).attr('opacity',1);
        d3.selectAll(".x.axis")
            .transition()
            .duration(500)
            .attr('opacity',0);
    };
    
    //Bisector function for mouseMoveHandle
    bisect = d3.bisector(function(d) {return d.date;}).left;
    
    function mouseMoveHandle(){
        var date = xScale.invert(d3.mouse(this)[0]);
        //Same x-value for all plots
        var index = 0;
        var xCur = null;
        circle.attr("cy", function(c) {
            index = bisect(c.values, date, 0, c.values.length - 1);  //This grabs the nearest x index to the left, and also modifies the value in the outer scope
            return c.yScale(yVal(c.values[index]));
        })
        .attr("cx", function(c) {
            xCur = xVal(c.values[index]);
            return xScale(xCur)
        });
        
        caption.attr("x", function(c) {return xScale(xCur)})
            .attr("y", function(c) {
            return c.yScale(yVal(c.values[index]));
        }).text(function(c) {
            return yVal(c.values[index]);
            });
        cursorStr = d3.timeFormat('%a,%e %b %y')(xCur); //TODO: use d3.timeFormat for desired form
        return curYear.attr("x", xScale(date)).text(cursorStr);
        
    }
    
    function mouseOutHandle(){
        circle.transition().duration(500).attr("opacity", 0);
        caption.transition().duration(500).attr("opacity", 0);
        curYear.transition().duration(500).attr("opacity", 0);
        d3.selectAll(".x.axis")
            .transition()
            .duration(500)
            .attr('opacity',1);
    }
    return chart;
}

//Actual data loading
//First load the json file containing the dates to load.
d3.json("data/DataList.json", function(error, dateList) {
    //Build up the actual dataset
    queue = d3.queue(); //Use d3's queue system for asynchronous reading
    for(var i=0; i<dateList.length;i++){
        queue.defer(d3.csv,"data/Test"+dateList[i]+".csv"); //Modify this to suit filename format
    };
    
    queue.awaitAll(display);

  function display(error, data){
      userToExtract = 'User10'; //Choose what we want here
      //console.log(data);
      //Plot the data here
      selection = d3.select('#vis'); //Plot inside the div with '#vis'
      timeSeries = multiple_graphs(selection,data,dateList,userToExtract);
      timeSeries(); //Do the actual plot
      
      //Define button behaviour
      d3.select('#btn1').on('click',function(){
        timeSeries.user('User1');  
      });
      d3.select('#btn2').on('click',function(){
        timeSeries.user('User3');  
      });
  }
    
});