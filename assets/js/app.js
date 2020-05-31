// Defining SVG dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg:svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(usData, chosenXAxis) {
  // create scales for x-axis
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(usData, d => d[chosenXAxis]) * 0.8,
      d3.max(usData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(usData, chosenYAxis) {
  // create scales for Y-axis
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(usData, d => d[chosenYAxis]) * 0.8,
      d3.max(usData, d => d[chosenYAxis])* 1.1])
      .range([height, 0]);

  return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to new circles when x axis is changed
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// Function used for updating circles group with a transition to new circles when Y axis is changed
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;
  var yLabel;

  // Revising labels for X-Axis
  if (chosenXAxis === "poverty") {
    xLabel = "Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age (Median):";
  }
  else {
    xLabel = "Household Income (Median):";
  }

  // Revising labels for Y-Axis
  if (chosenYAxis === "healthcare") {
    yLabel = "Healthcare (%):";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes (%):";
  }
  else {
    yLabel = "Obese (%):";
  }

  // Updating tooltips
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    console.log(data);
  
    // parse data
    data.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.obese = +data.obesity;
      data.smokes = +data.smokes;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
    });
  
    // Creating x scale
    var xLinearScale = xScale(data, chosenXAxis);
  
    // Creating y scale
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .classed("stateCircle", true)
      .attr("opacity", ".75");
  
    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var householdIncomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income ($, Median)");  
  
    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)");

    var healthcareYLabel = yLabelsGroup.append("text")
      .attr("y", 0 - (margin.left - 40))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var SmokesYLabel = yLabelsGroup.append("text")
      .attr("y", 0 - (margin.left - 20))
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseYLabel = yLabelsGroup.append("text")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obese") // value to grab for event listener
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");
  
    // function to updateToolTip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          console.log(chosenXAxis);
  
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text on x-axis
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            householdIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income"){
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            householdIncomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            householdIncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
      // Y axis labels event listener
      yLabelsGroup.selectAll("text").on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Replaces chosenYAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis);

        // Updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text on y-axis
          if (chosenYAxis === "smokes") {
            SmokesYLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareYLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseYLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obese") {
            SmokesYLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareYLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseYLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            SmokesYLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareYLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseYLabel
              .classed("active", false)
              .classed("inactive", true);
          }
      }
    });
  }).catch(function(err) {
    console.log(err);
    });
  

