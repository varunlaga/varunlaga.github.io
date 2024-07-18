// render math chart
function renderMathChart(data, showAnnotations = false) {
    // select the existing svg and remove it
    d3.select("#math-chart").select("svg").remove();

    // call drawMathChart function from math.js without annotations
    drawMathChart(data, showAnnotations);
}

// update math chart based on selected group
function updateMathChart(data, selectedGroup) {
    // select the existing svg and remove it
    d3.select("#math-chart").select("svg").remove();
    
    // set dimensions and margins
    const margin = {top: 50, right: 150, bottom: 100, left: 120};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // filter data based on selected group
    const filteredData = data.filter(d => d["race/ethnicity"] === selectedGroup);

    // calculate averages as in math.js
    const parentEducationLevels = ["some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree"];
    var stackedData = d3.group(filteredData, d => d["parental level of education"], d => d["gender"]);
    var averages = Array.from(stackedData, ([parentEdu, gender]) => ({
        parentEdu,
        female: gender.has("female") ? d3.mean(gender.get("female").filter(d => d["race/ethnicity"] === selectedGroup), d => d["math score"]).toFixed(2) : 0,
        male: gender.has("male") ? d3.mean(gender.get("male").filter(d => d["race/ethnicity"] === selectedGroup), d => d["math score"]).toFixed(2) : 0
    }));

    // append svg to body
    const svg = d3.select("#math-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // update bars
    var x0 = d3.scaleBand().domain(parentEducationLevels).range([0, width]).padding(0.2);
    var x1 = d3.scaleBand().domain(["female", "male"]).range([0, x0.bandwidth()]).padding(0.1);
    var y = d3.scaleLinear().domain([0, 80]).range([height, 0]);
    var color = d3.scaleOrdinal().domain(["female", "male"]).range(["pink", "blue"]);

    // define tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // append axes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickValues([0, 20, 40, 60, 80]));

    // append bars
    svg.append("g")
        .selectAll("g")
        .data(averages)
        .enter()
        .append("g")
        .attr("transform", d => "translate(" + x0(d.parentEdu) + ",0)")
        .selectAll("rect")
        .data(d => ["female", "male"].map(key => ({key, value: d[key]})))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value))
        .attr("width", x1.bandwidth())
        .attr("fill", d => color(d.key))
        // add tooltip
        .on("mouseover", function(event, d) {
            const parentEdu = d3.select(this.parentNode).datum().parentEdu;
            const gender = d.key;
            const averageScore = d.value;

            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            tooltip.html("Gender: " + gender + "<br>" +
                "Parental Level of Education: " + parentEdu + "<br>" +
                "Race/Ethnicity: " + selectedGroup + "<br>" +
                "Average Math Score: " + averageScore)
           .style("left", (event.pageX) + "px")
           .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
    
    // append title of chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .style("font-size", "15px")
        .text("Students Avg Math Scores by Gender and Parent Education, and Race " + selectedGroup);

    // append x axis title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .attr("class", "x-axis-title")
        .text("Parental Level of Education and Race " + selectedGroup);

    // append y axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", -margin.left + 80)
        .attr("text-anchor", "middle")
        .text("Average Math Scores");
    
    // add legend
    const legend = svg.append("g")
        .attr("transform", "translate(" + (width + 60) + "," + 30 + ")");

    // append legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "start")
        .style("font-size", "15px")
        .text("Gender");

    // append legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(color.domain())
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 20 + 20) + ")");

    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .style("font-size", "15px")
        .text(d => d);
}

// render reading chart
function renderReadingChart(data, showAnnotations = false) {
    // select the existing svg and remove it
    d3.select("#reading-chart").select("svg").remove();

    // call drawReadingChart function from reading.js without annotations
    drawReadingChart(data, showAnnotations);
}

// update reading chart based on selected group
function updateReadingChart(data, selectedGroup) {
    // select the existing svg and remove it
    d3.select("#reading-chart").select("svg").remove();
    
    // set dimensions and margins
    const margin = {top: 50, right: 150, bottom: 100, left: 120};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // filter data based on selected group
    const filteredData = data.filter(d => d["race/ethnicity"] === selectedGroup);

    // calculate averages as in reading.js
    const parentEducationLevels = ["some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree"];
    var stackedData = d3.group(filteredData, d => d["parental level of education"], d => d["gender"]);
    var averages = Array.from(stackedData, ([parentEdu, gender]) => ({
        parentEdu,
        female: gender.has("female") ? d3.mean(gender.get("female").filter(d => d["race/ethnicity"] === selectedGroup), d => d["reading score"]).toFixed(2) : 0,
        male: gender.has("male") ? d3.mean(gender.get("male").filter(d => d["race/ethnicity"] === selectedGroup), d => d["reading score"]).toFixed(2) : 0
    }));

    // append svg to body
    const svg = d3.select("#reading-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // update bars
    var x0 = d3.scaleBand().domain(parentEducationLevels).range([0, width]).padding(0.2);
    var x1 = d3.scaleBand().domain(["female", "male"]).range([0, x0.bandwidth()]).padding(0.1);
    var y = d3.scaleLinear().domain([0, 80]).range([height, 0]);
    var color = d3.scaleOrdinal().domain(["female", "male"]).range(["pink", "blue"]);

    // define tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // append axes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickValues([0, 20, 40, 60, 80]));

    // append bars
    svg.append("g")
        .selectAll("g")
        .data(averages)
        .enter()
        .append("g")
        .attr("transform", d => "translate(" + x0(d.parentEdu) + ",0)")
        .selectAll("rect")
        .data(d => ["female", "male"].map(key => ({key, value: d[key]})))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value))
        .attr("width", x1.bandwidth())
        .attr("fill", d => color(d.key))
        // add tooltip
        .on("mouseover", function(event, d) {
            const parentEdu = d3.select(this.parentNode).datum().parentEdu;
            const gender = d.key;
            const averageScore = d.value;

            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            tooltip.html("Gender: " + gender + "<br>" +
                "Parental Level of Education: " + parentEdu + "<br>" +
                "Race/Ethnicity: " + selectedGroup + "<br>" +
                "Average Reading Score: " + averageScore)
           .style("left", (event.pageX) + "px")
           .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
    
    // append title of chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("class", "secondchart-title")
        .style("font-size", "15px")
        .text("Students Avg Reading Scores by Gender and Parent Education, and Race " + selectedGroup);

    // append x axis title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .attr("class", "secondx-axis-title")
        .text("Parental Level of Education and Race " + selectedGroup);

    // append y axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", -margin.left + 80)
        .attr("text-anchor", "middle")
        .text("Average Reading Scores");
    
    // add legend
    const legend = svg.append("g")
        .attr("transform", "translate(" + (width + 60) + "," + 30 + ")");

    // append legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "start")
        .style("font-size", "15px")
        .text("Gender");

    // append legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(color.domain())
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + (i * 20 + 20) + ")");

    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .style("font-size", "15px")
        .text(d => d);
}

// parse the data and call the functions
d3.csv("https://raw.githubusercontent.com/varunlaga/varunlaga.github.io/main/exams.csv").then(function(data) {
    // add event listener to dropdown
    document.getElementById("race-ethnicity-dropdown").addEventListener("change", function() {
        // sets selectedGroup to the value of the selected option in dropdown
        let selectedGroup = this.value;

        // initial render of both charts without annotations
        renderMathChart(data, false);
        renderReadingChart(data, false);

        // render both charts based on default Select option
        if (selectedGroup == "Select") {
            renderMathChart(data, false);
            renderReadingChart(data, false);
        } else {
            // update charts based on selected group
            updateMathChart(data, selectedGroup);
            updateReadingChart(data, selectedGroup);
        }
    });
});