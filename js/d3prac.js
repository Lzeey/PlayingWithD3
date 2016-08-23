$(document).ready(function(){
    //Insert circle.
    d3.select("body")
    .append("svg")
    .attr("width", 50)
    .attr("height", 50)
    .append("circle")
    .attr("cx", 25)
    .attr("cy", 25)
    .attr("r", 25)
    .style("fill", "blue");
    
    var theData = [1,2,3,4];
    
    var p = d3.select('body').selectAll('p') //select all p on page, which is none (empty list)
    .data(theData) //joins array to current selection, so 3 virtual selections
    .enter() //the 3 reference 
    .append('p')
    .text(function(d) {return d+2});//d is data. i is index
    
    var circRadii = [40,20,10];
    
    var svgContainer = d3.select('body').append('svg')
                                        .attr('width',200)
                                        .attr('height',200);
    
    var circles = svgContainer.selectAll('circle')
                            .data(circRadii)
                            .enter()
                            .append('circle');
    
    var circleAttr = circles
    .attr('cx',100)
    .attr('cy',100)
    .attr('r',function(d){return d})
    .style('fill',function(d) {
            var returnColor;
            if (d === 40) { returnColor = "green";
            } else if (d === 20) { returnColor = "purple";
            } else if (d === 10) { returnColor = "red"; }
                return returnColor;
            });

})

