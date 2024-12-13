export class VisualisationProcessor {
    constructor(containerId, textContainerId) {
        this.containerId = containerId
        this.textContainerId = textContainerId
        this.svg = null
        this.textSvg = null
    }

    initialiseSvg(width = 1250, height = 425, textHeight = 150) {
        this.svg = d3.select(this.containerId)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("cursor", "pointer");

            this.textSvg = d3.select(this.textContainerId)
            .append("svg")
            .attr("width", width)
            .attr("height", textHeight);
    }

    createText(y, text) {
        this.textSvg.append("text")
            .attr("x", 625)  
            .attr("y", y)  
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#000000")
            .text(text);
    }

    drawCircle(x, y, radius, depth, groupedData, arrayIndex, textIndex) {
        if (depth === 0 || arrayIndex >= groupedData.length) {
            return; // Stop recursion at base depth
        }

        let circleColor = "#afdba4"; // Default color
    if (textIndex % 2 === 0 && textIndex + 1 < groupedData[arrayIndex].length) {
        // Ensure the current index has a neighbor to compare
        if (groupedData[arrayIndex][textIndex] > groupedData[arrayIndex][textIndex+1]) {
            circleColor = "#b1b2e6"; 
        }
    }
      // Draw the circle
        this.svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radius)
        .attr("fill", circleColor)
        .attr("stroke", "#ffffff");

        const text = groupedData[arrayIndex][textIndex];
        this.svg.append("text")
            .attr("x", x)
            .attr("y", y - radius + 15) // Center the text vertically
            .attr("text-anchor", "middle")
            .style("fill", "#000000")
            .style("font-size", "12px")
            .text(text);
    
        const newRadius = radius / 2; // Smaller circle radius
        const nextTextIndex = textIndex + 1
        this.drawCircle(x + radius + newRadius, y, newRadius, depth - 1, groupedData, arrayIndex + 1, nextTextIndex*2-1); // Right
        this.drawCircle(x - radius - newRadius, y, newRadius, depth - 1, groupedData, arrayIndex + 1, (nextTextIndex-1)*2); // Left

        this.svg.on("click", () => {
            currentDepth = (currentDepth % 5) + 1; // Increment depth and reset
    
            this.svg.selectAll("*").remove(); // Clear existing elements
    
            // Redraw circles with text based on the new depth
            this.drawCircle(625, 200, 205, currentDepth, groupedData);
        });
      }
}