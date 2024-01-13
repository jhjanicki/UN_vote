// dimensions related
const windowWidth = $(window).width();
const windowHeight = $(window).height();

$(window).resize(function() {
    if (
        windowWidth != $(window).width() ||
        windowHeight != $(window).height()
    ) {
        location.reload();
        return;
    }
});

const scaleFactor = 2 * windowWidth / 2000;
const scale = 130; // the higher the value the further apart the squares are

const xOffset = 0; //100 *windowWidth / 2000;

const margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    width = (windowWidth - margin.left - margin.right)
height = (windowHeight - margin.top - margin.bottom),
    padding = 0;


const votes = ['IN_FAVOR', 'ABSTENTION', 'AGAINST', 'ABSENT']
const votesAgainst = ["Ukraine only", "Gaza Oct only", "Gaza Dec only", "Gaza both"];
const regions = [...new Set(data.map(d => d.region))]

const colors = ["#377eb8", "#edbcdc", "#ba63a7", "#f1f1f1"]
const colorScale = d3.scaleOrdinal().domain(votes).range(colors);
const xScale = d3.scaleOrdinal().domain(votes).range([(width - xOffset) * 1 / 5, (width - xOffset) * 2 / 5, (width - xOffset) * 3 / 5, (width - xOffset) * 4 / 5])
const xScaleRegions = d3.scaleOrdinal().domain(regions).range([(width - xOffset) * 1 / 8, (width - xOffset) * 2 / 8, (width - xOffset) * 3 / 8, (width - xOffset) * 4 / 8, (width - xOffset) * 5 / 8, (width - xOffset) * 6 / 8, (width - xOffset) * 7 / 8])
const xScaleChange = d3.scaleOrdinal().domain([...votes, "TO_FAVOUR", "TO_ABSTENTION", "TO_AGAINST", "TO_ABSENT"]).range([(width - xOffset) * 1 / 5, (width - xOffset) * 2 / 5, (width - xOffset) * 3 / 5, (width - xOffset) * 4 / 5, (width - xOffset) * 1 / 5, (width - xOffset) * 2 / 5, (width - xOffset) * 3 / 5, (width - xOffset) * 4 / 5])
const yScaleChange = d3.scaleOrdinal().domain([0, 1]).range([height * 2 / 4, height * 3 / 4])
const xScaleAgainst = d3.scaleOrdinal().domain(votesAgainst).range([(width - xOffset) * 1 / 5, (width - xOffset) * 2 / 5, (width - xOffset) * 3 / 5, (width - xOffset) * 4 / 5])



let voteNumUkraine = createVoteData("Ukraine", true)
let voteNumGazaOct = createVoteData("Gaza_Oct", true)
let voteNumGazaDec = createVoteData("Gaza_Dec", true)

let voteRegion = createVoteData("region", false)


function createVoteData(property, sort) {

    let votesNum = data.reduce((acc, obj) => {
        const index = acc.findIndex(item => item.category === obj[property]);
        if (index !== -1) {
            acc[index].count++;
        } else {
            acc.push({
                category: obj[property],
                count: 1
            });
        }
        return acc;
    }, []);


    if (sort) {
        let ordering = {}, // map for efficient lookup of sortIndex
            sortOrder = ['IN_FAVOR', 'ABSTENTION', 'AGAINST', 'ABSENT'];
        for (var i = 0; i < sortOrder.length; i++)
            ordering[sortOrder[i]] = i;

        votesNum = votesNum.sort((a, b) =>
            (ordering[a.category] - ordering[b.category])
        );
        return votesNum
    } else {
        return votesNum
    }

}

let voteByRegionUkraine = countOccurrencesByRegionFormatted("Ukraine")
let voteByRegionGazaOct = countOccurrencesByRegionFormatted("Gaza_Oct")
let voteByRegionGazaDec = countOccurrencesByRegionFormatted("Gaza_Dec")

function countOccurrencesByRegionFormatted(option) {
    const countByRegion = {};
    data.forEach(item => {
        const {
            [option]: optionValue, region
        } = item;
        if (!countByRegion[optionValue]) {
            countByRegion[optionValue] = {};
        }
        if (!countByRegion[optionValue][region]) {
            countByRegion[optionValue][region] = 1;
        } else {
            countByRegion[optionValue][region]++;
        }
    });

    const formattedOutput = Object.keys(countByRegion).map(optionValue => {
        const regionsObj = {
            vote: optionValue
        };
        for (const region in countByRegion[optionValue]) {
            regionsObj[region] = countByRegion[optionValue][region];
        }
        return regionsObj;
    });

    return formattedOutput;
}

const wrap = (text, width) => {
  text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0, //<-- 0!
          lineHeight = 1.1, // ems
          x = text.attr("x"), //<-- include the x!
          y = text.attr("y"),
          dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
      }
  });
}



const projection = d3
    .geoEquirectangular()
    .scale(scale * scaleFactor)
    .translate([width / 2, height / 2]);

const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const rectWidth = windowWidth > 900 ? (24 * windowWidth / 1800) : 16;
const radius = windowWidth > 900 ? (15 * windowWidth / 1800) : 10;

d3.json("./data/centroid-country.json").then((countries) => {
    countries.features.forEach((country) => {
        data.forEach((countryData) => {
            if (countryData.CountryName === country.properties.name) {
                country.properties.CountryCode = countryData.alpha3;
                country.properties.Gaza_Dec = countryData.Gaza_Dec;
                country.properties.Gaza_Oct = countryData.Gaza_Oct;
                country.properties.Ukraine = countryData.Ukraine;
                country.properties.region = countryData.region;
                country.properties.GazaChange = countryData.GazaChange;
                country.properties.against = countryData.AGAINST;
                country.properties.changed = countryData.changed;
            }
        });
    });

    let nodes = countries.features.map(function(d) {

        const point = projection(d.geometry.coordinates);

        return {
            x: point[0],
            y: point[1],
            x0: point[0],
            y0: point[1],
            r: 10,
            country: d.properties.name,
            income: d.properties.income || "",
            CountryCode: d.properties.CountryCode || "",
            region: d.properties.region,
            Gaza_Dec: d.properties.Gaza_Dec,
            Gaza_Oct: d.properties.Gaza_Oct,
            Ukraine: d.properties.Ukraine,
            xGaza_Dec: xScale(d.properties.Gaza_Dec),
            xGaza_Oct: xScale(d.properties.Gaza_Oct),
            xUkraine: xScale(d.properties.Ukraine),
            xRegion: xScaleRegions(d.properties.region),
            xGazaChange: xScaleChange(d.properties.GazaChange),
            yGazaChange: yScaleChange(d.properties.changed),
            xAgainst: xScaleAgainst(d.properties.against),
            against: d.properties.against
        };
    });


    nodes = nodes.filter(d => d.CountryCode != "")

    const nodeG = svg
        .selectAll("g.rectG")
        .data(nodes)
        .join("g")
        .attr("class", "rectG");

const createRect = (classSelector, xFn, widthFn, fillFn) => {
        nodeG
            .append("rect")
            .attr("class", (d) => `${classSelector} ${d.CountryCode}`)
            .attr("id", (d) => `${classSelector}_${d.CountryCode}`)
            .attr("width", widthFn)
            .attr("height", rectWidth)
            .attr("fill", fillFn)
            .attr("stroke", "white")
            .attr("stroke-width", 0.3);
    };

    createRect('Gaza_Dec', (d) => d.x, rectWidth / 3, (d) => colorScale(d.Gaza_Dec));
    createRect('Gaza_Oct', (d) => d.x - rectWidth / 3, rectWidth / 3, (d) => colorScale(d.Gaza_Oct));
    createRect('Ukraine', (d) => d.x - rectWidth / 3 * 2, rectWidth / 3, (d) => colorScale(d.Ukraine));

    nodeG
        .append("text")
        .attr("class", "text")
        .attr("fill", "black")
        .attr("font-size", 11)
        .attr("font-weight", 700)
        .attr("text-anchor", "middle")
        .attr("dx", -4)
        .attr("dy", 3)
        .text((d) => d.CountryCode);



    svg.selectAll("text.annotations").data(voteNumUkraine).join("text").attr("class", "annotations").attr("x", d => xScale(d.category) - 40).attr("y", height / 4).text(d => `${d.category.replaceAll("_", " ")}: ${d.count} (${(d.count/193*100).toFixed(1)}%)`).attr("fill", "white").style("opacity", 0)
    svg.append("text").attr("class", "mainText").attr("x", 50).attr("y", 100).text("How the UN member states voted on General Assembly Resolutions related to Ukraine and Gaza (Oct / Dec)").attr("fill", "white").call(wrap, windowWidth>1200?windowWidth/3:300).call(wrap, windowWidth>1200?windowWidth/3:300)


    d3.forceSimulation(nodes)
        .force(
            "x",
            d3.forceX().x((d) => d.x)
        )
        .force(
            "y",
            d3.forceY().y((d) => d.y)
        )
        .force(
            "collision",
            d3.forceCollide().radius(radius)
        )
        .on("tick", function() {
            nodeG
                .selectAll("rect.Gaza_Dec")
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y - rectWidth / 2)

            nodeG
                .selectAll("rect.Gaza_Oct")
                .attr("x", (d) => d.x - rectWidth / 3)
                .attr("y", (d) => d.y - rectWidth / 2)

            nodeG
                .selectAll("rect.Ukraine")
                .attr("x", (d) => d.x - rectWidth / 3 * 2)
                .attr("y", (d) => d.y - rectWidth / 2)

            nodeG.selectAll('.text')
                .attr('x', d => d.x)
                .attr('y', d => d.y)
        });

      


    let index = 0;
    $("#next").on("click", function() {
        d3.select("#next").style("pointer-events", "none").style("opacity", 0.1)
        setTimeout(function() {
            d3.select("#next").style("pointer-events", "auto").style("opacity", 1)
        }, 1000)
        index++;
        if (index == 1) {
            d3.select(".mainText").text("How the member states voted on Ukraine on March 2, 2022, which deplored Russia's invasion of Ukraine and demanded a full withdrawal.").call(wrap, windowWidth>1200?windowWidth/3:300)
            d3.selectAll(".Gaza_Dec").transition().duration(300).style("opacity", 0)
            d3.selectAll(".Gaza_Oct").transition().duration(300).style("opacity", 0)
            setTimeout(function() {
                d3.selectAll(".Ukraine").transition().duration(300).attr("width", rectWidth);

            }, 600)
        }

        if (index === 2) {
            d3.select(".mainText").text("Vote distribution, out of a total of 193:").call(wrap, windowWidth>1200?windowWidth/3:300)
            d3.selectAll(".annotations").transition().duration(300).style("opacity", 1)
            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xUkraine)
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2)
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius)
                )
                .on("tick", function() {
                    nodeG
                        .selectAll("rect.Ukraine")
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x + rectWidth / 3 * 2)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }

        if (index === 3) {
            d3.select(".mainText").text("Vote distribution by region:").call(wrap, windowWidth>1200?windowWidth/3:300)
            svg.selectAll("text.annotations").data(voteRegion).join("text").attr("class", "annotations").style("opacity", 1).attr("text-anchor", "middle").attr("x", d => xScaleRegions(d.category)).attr("y", d => height / 4).transition().duration(300).text(d => `${d.category} (${d.count})`).style("opacity", 1).attr("fill", "white")
            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xRegion)
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2)
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius)
                )
                .on("tick", function() {
                    nodeG
                        .selectAll("rect.Ukraine")
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .attr('x', d => d.x + rectWidth / 3 * 2)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }


        if (index === 4) {
            d3.select(".mainText").text("How did member states vote in relation to resolutions on Gaza on Oct 27 (‘humanitarian truce’) and Dec 12 (immediate humanitarian ceasefire)").call(wrap, windowWidth>1200?windowWidth/3:300)
            d3.selectAll(".annotations").style("opacity", 0)
            d3.selectAll(".Gaza_Dec").style("opacity", 1)
            d3.selectAll(".Gaza_Oct").style("opacity", 1)
            d3.selectAll(".Ukraine").attr("width", rectWidth / 3)

            d3.selectAll(".Ukraine").transition().duration(300).style("opacity", 0)
            setTimeout(function() {
                d3.selectAll(".Gaza_Oct").transition().duration(300).attr("width", rectWidth / 2).attr("transform", `translate(${-rectWidth/3},0)`) // was at 8, move to 0
                d3.selectAll(".Gaza_Dec").transition().duration(300).attr("width", rectWidth / 2).attr("transform", `translate(${-rectWidth/6},0)`) // wa
            }, 600)


            d3.forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.x0)
                )
                .force(
                    "y",
                    d3.forceY().y((d) => d.y0)
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius)
                ).on("tick", function() {
                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .attr("x", (d) => d.x)
                        .attr("y", (d) => d.y - rectWidth / 2)

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .attr("x", (d) => d.x - rectWidth / 3)
                        .attr("y", (d) => d.y - rectWidth / 2)

                    nodeG
                        .selectAll("rect.Ukraine")
                        .attr("x", (d) => d.x - rectWidth / 3 * 2) //d.x - d.r
                        .attr("y", (d) => d.y - rectWidth / 2) //d.y - d.r

                    nodeG.selectAll('.text')
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)
                });

        }




        if (index === 5) {
            d3.select(".mainText").text("On October 27, member states voted on a resolution on Gaza that called for an 'immediate, durable and sustained humanitarian truce leading to a cessation of hostilities'").call(wrap, windowWidth>1200?windowWidth/3:300)
            d3.selectAll("text.annotations").data(voteNumGazaOct).join("text").attr("class", "annotations").attr("x", d => xScale(d.category) - 40).attr("y", height / 4).text(d => `${d.category.replaceAll("_", " ")}: ${d.count} (${(d.count/193*100).toFixed(1)}%)`).style("opacity", 1)

            d3.forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xGaza_Oct) //(d) => d.x - d.r
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2) //(d) => d.y - d.r
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius) // (d) => d.r * 1.2 + 1.4
                )
                .on("tick", function() {

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .transition().duration(30)
                        .attr('x', d => d.x - rectWidth / 3)
                        .attr('y', d => d.y)
                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }

        if (index === 6) {
            d3.select(".mainText").text("On Dec 12, member states voted again on a different resolution on Gaza that called for an 'immediate humanitarian ceasefire'").call(wrap, windowWidth>1200?windowWidth/3:300)
            d3.selectAll("text.annotations").data(voteNumGazaDec).join("text").attr("class", "annotations").attr("x", d => xScale(d.category) - 40).attr("y", height / 4).text(d => `${d.category.replaceAll("_", " ")}: ${d.count} (${(d.count/193*100).toFixed(1)}%)`).style("opacity", 1)

            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xGaza_Dec) //(d) => d.x - d.r
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2) //(d) => d.y - d.r
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius) // (d) => d.r * 1.2 + 1.4
                )
                .on("tick", function() {

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .transition().duration(30)
                        .attr('x', d => d.x - 8)
                        .attr('y', d => d.y)
                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }

        if (index === 7) {
          d3.select(".mainText").text("These are the member states that changed their votes the second time in Dec").call(wrap, windowWidth>1200?windowWidth/3:300)

            d3.selectAll("text.annotations").data(voteNumGazaDec).join("text").attr("class", "annotations").attr("x", d => xScale(d.category) - 40).attr("y", height / 4).text(d => `${d.category.replaceAll("_", " ")}: ${d.count} (${(d.count/193*100).toFixed(1)}%)`).style("opacity", 1)

            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xGazaChange) //(d) => d.x - d.r
                )
                .force(
                    "y",
                    d3.forceY().y(d => d.yGazaChange) //(d) => d.y - d.r
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius) // (d) => d.r * 1.2 + 1.4
                )
                .on("tick", function() {

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .transition().duration(30)
                        .attr('x', d => d.x - rectWidth / 3)
                        .attr('y', d => d.y)
                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }



        if (index === 8) {
            d3.select(".mainText").text("And this is how the votes are distributed by region:").call(wrap, windowWidth>1200?windowWidth/3:300)
            svg.selectAll("text.annotations").data(voteRegion).join("text").attr("class", "annotations").style("opacity", 1).attr("text-anchor", "middle").attr("x", d => xScaleRegions(d.category)).attr("y", d => height / 4).transition().duration(300).text(d => `${d.category} (${d.count})`).style("opacity", 1).attr("fill", "white")
            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xRegion)
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2)
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius) // (d) => d.r * 1.2 + 1.4
                )
                .on("tick", function() {

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .transition().duration(30)
                        .attr('x', d => d.x - rectWidth / 3)
                        .attr('y', d => d.y)
                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y + rectWidth / 2)
                });
        }

        if (index === 9) {
            d3.select(".mainText").text("Here are all the member states that voted 'AGAIST' at least once. No member states have voted against on all three occassions").call(wrap, windowWidth>1200?windowWidth/3:300)
            svg.selectAll("text.annotations").data(votesAgainst).join("text").attr("class", "annotations").style("opacity", 1).attr("text-anchor", "middle").attr("x", d => xScaleAgainst(d)).attr("y", d => height / 4).transition().duration(300).text(d => d).style("opacity", 1).attr("fill", "white")
            d3.selectAll(".Ukraine").style("opacity", 1)
            d3.selectAll("rect").attr("width", rectWidth / 3)
            nodes = nodes.filter(d => d.against !== "none")

            d3
                .forceSimulation(nodes)
                .force(
                    "x",
                    d3.forceX().x((d) => d.xAgainst) //(d) => d.x - d.r
                )
                .force(
                    "y",
                    d3.forceY().y(height / 2) //(d) => d.y - d.r
                )
                .force(
                    "collision",
                    d3.forceCollide().radius(radius) // (d) => d.r * 1.2 + 1.4
                )
                .on("tick", function() {

                    nodeG
                        .selectAll("rect")
                        .style("display", d => d.against === "none" ? "none" : "block")

                    nodeG
                        .selectAll("text")
                        .style("display", d => d.against === "none" ? "none" : "block")

                    nodeG
                        .selectAll("rect.Gaza_Dec")
                        .transition().duration(30)
                        .attr("x", (d) => d.x + rectWidth / 6)
                        .attr("y", (d) => d.y - rectWidth / 2)

                    nodeG
                        .selectAll("rect.Gaza_Oct")
                        .transition().duration(30)
                        .attr("x", (d) => d.x)
                        .attr("y", (d) => d.y - rectWidth / 2)

                    nodeG
                        .selectAll("rect.Ukraine")
                        .transition().duration(30)
                        .attr("x", (d) => d.x - rectWidth / 3 * 2)
                        .attr("y", (d) => d.y - rectWidth / 2)

                    nodeG.selectAll('.text')
                        .transition().duration(30)
                        .attr('x', d => d.x)
                        .attr('y', d => d.y)
                });

        }

    });
});