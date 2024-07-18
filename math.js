// draw math chart
function drawMathChart(data, showAnnotations = true) {
    // set dimensions and margins
    const margin = {top: 50, right: 200, bottom: 100, left: 180};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // append svg to body
    const svg = d3.select("#math-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // define the parental levels of education
    const parentEducationLevels = ["some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree"];

    // create stacked data structure by parental level of education and gender
    const stackedData = d3.group(data, d => d["parental level of education"], d => d["gender"]);

    // calculate average math scores for each parental education level and gender
    const averages = Array.from(stackedData, ([parentEdu, gender]) => ({
        parentEdu,
        female: gender.has("female") ? d3.mean(gender.get("female"), d => d["math score"]).toFixed(2) : 0,
        male: gender.has("male") ? d3.mean(gender.get("male"), d => d["math score"]).toFixed(2) : 0
    }));

    // find max values for annotations
    const maxFemaleData = averages.reduce((acc, d) => d.female > acc.female ? d : acc, { female: 0 });
    const maxMaleData = averages.reduce((acc, d) => d.male > acc.male ? d : acc, { male: 0 });

    // extract max avg math scores for female and math students with their corresponding parent education levels
    const maxFemaleMath = maxFemaleData.female;
    const maxFemaleParentEdu = maxFemaleData.parentEdu;
    const maxMaleMath = maxMaleData.male;
    const maxMaleParentEdu = maxMaleData.parentEdu;

    // set x0 scale representing band scale for different levels of parental education
    const x0 = d3.scaleBand()
        .domain(parentEducationLevels)
        .range([0, width])
        .padding(0.2);

    // set x1 scale representing nested band scale within each x0 band so gender categories within each parental level
    const x1 = d3.scaleBand()
        .domain(["female", "male"])
        .range([0, x0.bandwidth()])
        .padding(0.1);

    // set y scale
    const y = d3.scaleLinear()
        .domain([0, 80])
        .range([height, 0]);

    // define color scale for gender
    const color = d3.scaleOrdinal()
        .domain(["female", "male"])
        .range(["pink", "blue"]);

    // define tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // append x axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // append y axis
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
        .data(d => ["male", "female"].map(key => ({ key: key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", function(event, d) {
            const gender = d.key;
            const parentEdu = d3.select(this.parentNode).datum().parentEdu;
            const averageScore = d.value;

            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            tooltip.html("Gender: " + gender + "<br>" +
                "Parental Level of Education: " + parentEdu + "<br>" +
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
        .text("Students Avg Math Scores by Gender and Parent Education");

    // append x axis title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 40)
        .attr("text-anchor", "middle")
        .attr("class", "x-axis-title")
        .text("Parental Level of Education");

    // append y axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", -margin.left + 140)
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

    // append two small rectangles as color boxes to represent color for both genders
    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);

    // append two texts next to both color boxes indicating female and male
    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .style("font-size", "15px")
        .text(d => d);

    // call addAnnotations function
    if(showAnnotations) {
        addAnnotations(svg, x0, x1, y, maxFemaleMath, maxFemaleParentEdu, maxMaleMath, maxMaleParentEdu);
    }
}

// add annotations
function addAnnotations(svg, x0, x1, y, maxFemaleMath, maxFemaleParentEdu, maxMaleMath, maxMaleParentEdu) {
    // define the annotations
    const annotations = [
        {
            note: {
                label: "Female Highest Avg Math Score: " + maxFemaleMath + "\nParental Education: " + maxFemaleParentEdu,
                wrap: 100,
                wrapSplitter: /\n/, 
                align: "left"
            },
            connector: {
                type: "line",
                end: "arrow", 
                lineType: "horizontal",
                style: {
                    "stroke-width": 1 
                }
            },
            x: x0(maxFemaleParentEdu) + x1("female") + x1.bandwidth() / 2,
            y: y(maxFemaleMath),
            dy: 100,
            dx: 40
        },
        {
            note: {
                label: "Male Highest Avg Math Score: " + maxMaleMath + "\nParental Education: " + maxMaleParentEdu,  
                wrap: 100,
                wrapSplitter: /\n/, 
                align: "left"
            },
            connector: {
                type: "line",
                end: "arrow", 
                lineType: "horizontal",
                style: {
                    "stroke-width": 1 
                }
            },
            x: x0(maxMaleParentEdu) + x1("male") + x1.bandwidth() / 2,
            y: y(maxMaleMath),
            dy: 180,
            dx: 65
        }
    ];

    // create the annotations
    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    // append the annotations to svg
    svg.append("g")
        .call(makeAnnotations);

    // set annotation font styles
    svg.selectAll(".annotation-note-label")
        .style("font-size", "10px")
        .style("font-weight", "bold");
}

// parse the data and call the functions
d3.csv("https://raw.githubusercontent.com/varunlaga/varunlaga.github.io/main/exams.csv").then(function(data) {
    drawMathChart(data, true);
});