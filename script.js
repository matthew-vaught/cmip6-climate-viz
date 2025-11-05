// D3.js line chart for CMIP6 temperature trends
const margin = { top: 30, right: 40, bottom: 40, left: 60 },
      width = 750 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load CSV
d3.csv("web_data/temperature_trends.csv").then(data => {
  data.forEach(d => {
    d.year = +d.year;
    d.temperature_anomaly = +d.temperature_anomaly;
  });

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.temperature_anomaly))
    .nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(y);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Global Mean Temperature Anomaly (°C)");

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.temperature_anomaly));

  // Function to update chart based on scenario
  function update(scenario) {
    const filtered = data.filter(d => d.scenario === scenario);

    const path = svg.selectAll(".line").data([filtered]);

    path.enter()
      .append("path")
      .attr("class", "line")
      .merge(path)
      .transition()
      .duration(1000)
      .attr("fill", "none")
      .attr("stroke", scenario === "ssp126" ? "#22c55e"
            : scenario === "ssp245" ? "#facc15"
            : "#ef4444")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Tooltip circles
    const circles = svg.selectAll(".dot").data(filtered);
    circles.enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .attr("fill", "#000")
      .merge(circles)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.temperature_anomaly))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Year: ${d.year}<br>ΔT: ${d.temperature_anomaly.toFixed(2)}°C`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));
  }

  // Initial draw
  update("ssp126");

  // Update when dropdown changes
  d3.select("#scenario-select").on("change", (event) => {
    update(event.target.value);
  });
});