const ageGroups = []
const fourGroups = []
const ageSums = {"0-4 years":0, "5-9 years":0, "10-14 years":0, "15-19 years":0, "20-24 years":0, "25-29 years":0, "30-34 years":0, "35-39 years":0, "40-44 years":0, "45-49 years":0, "50-54 years":0, "55-59 years":0, "60-64 years":0, "50+ years":0}
d3.queue().defer(d3.csv, "assets/unicef-data.csv")
.awaitAll(function(error, results) {
    if (error) throw error
    const csvData = results[0]

    function bubbleSort(arr) {
        console.time('Bubble Sort Time')
        
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
            }
        }
        console.timeEnd('Bubble Sort Time')
        return arr;
    }

    function quickSort(arr, key) {
        
        if (arr.length <= 1) {
            return arr;
        }
        
        // Use the pivot based on the key value
        let pivot = arr[Math.floor(arr.length / 2)];
        let pivotValue = pivot[key];
        
        let left = arr.filter(item => item[key] < pivotValue);
        let middle = arr.filter(item => item[key] === pivotValue);
        let right = arr.filter(item => item[key] > pivotValue);

        return quickSort(left, key).concat(middle, quickSort(right, key));
    }   

    function linearSearch(arr, target) {
        console.time('Linear Search Time')
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]["subgroup"] === target) {
            console.timeEnd('Linear Search Time')
            return i;
          }
        }
        console.timeEnd('Linear Search Time')
        return -1;
      }
    
    function binarySearchFirst(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        let result = -1; // Initialize result to -1 to indicate not found
    
        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
    
            if (arr[mid]["subgroup"] === target) {
                result = mid; // Update result to the current position
                right = mid - 1; // Continue searching in the left half
            } else if (arr[mid]["subgroup"] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result; // Return the first occurrence index or -1 if not found
    }

    for (const row of csvData) {
        const { dimension, estimate, subgroup, setting, population } = row;
    
        if (/Age \((10|9) groups\)/.test(dimension) || dimension === "Age (4 groups) (0-17)" || subgroup === "50+ years") {
            if (estimate !== "" && subgroup !== "15-17 years") {
                ageGroups.push({country: setting, dimension, subgroup, population});
            }
        }
    }

    const uniqueData = ageGroups.filter((item, index, self) =>
        index === self.findIndex((val) => (
            val.dimension === item.dimension && val.subgroup === item.subgroup && val.country === item.country && val.population === item.population
        ))
    )

    function timedQuickSort(arr, key) {
        console.time('Quick Sort Time');
        const sortedArray = quickSort(arr, key);
        console.timeEnd('Quick Sort Time');
        return sortedArray;
    }
    
    function timedBinarySearch(arr, target) {
        console.time('Binary Search Time')
        const searchedArray = binarySearchFirst(arr, target)
        console.timeEnd('Binary Search Time')
        return searchedArray
    }
    const sortedUniqueData = timedQuickSort(uniqueData, "subgroup")
    // console.log(sortedUniqueData)

    const subgroups = uniqueData.map(item => parseFloat(item.population));
    const sortedSubgroups = bubbleSort(subgroups)
    const halfIndex = linearSearch(sortedUniqueData, "5-9 years")
    const quarterIndex = timedBinarySearch(sortedUniqueData, "20-24 years")
    const eighthIndex = timedBinarySearch(sortedUniqueData, "10-14 years")
    const sixteenthIndex = timedBinarySearch(sortedUniqueData, "40-44 years")

    console.log(sortedSubgroups)
    console.log('Middle Index: '+halfIndex)
    console.log('Quarter Index: '+quarterIndex)
    console.log('Quarter Index: '+eighthIndex)
    console.log('Quarter Index: '+sixteenthIndex)

    for (let i = 0; i < sortedUniqueData.length; i++) {
        ageSums[sortedUniqueData[i]["subgroup"]] += parseInt(sortedUniqueData[i]["population"])
    }
    // console.log(ageSums)
    
    function getGrouping(ageSums) {
        const group1 = Object.values(ageSums).reduce((sum, value) => sum + value, 0); // Total sum of all values
        const keys = Object.keys(ageSums); // Get all keys
        const totalKeys = keys.length;
    
        const groups = [[group1]]; // Start with group1
    
        let divisor = 2; // Start with halves for group2
        let groupIndex = 2; // Track the group number
    
        while (divisor <= 16) {
            const chunkSize = Math.ceil(totalKeys / divisor); // Determine the size of each chunk
            const group = [];
    
            for (let i = 0; i < totalKeys; i += chunkSize) {
                const chunkKeys = keys.slice(i, i + chunkSize); // Get keys for this chunk
                const chunkSum = chunkKeys.reduce((sum, key) => sum + ageSums[key], 0); // Sum the values
                group.push(chunkSum);
            }
    
            groups.push(group); // Add the group array to the results
            divisor *= 2; // Double the divisor for the next group
            groupIndex++; // Increment group number
        }
    
        return groups;
    }

    allGroups = getGrouping(ageSums)
    allGroups[3].push(126405)
    allGroups[4].push(126405, 126405)

    // console.log(allGroups)

    // Functioning visualisation
    const width = 1250;
    const height = 425;
    let currentDepth = 1
    const svg = d3.select("#visualisation")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("cursor", "pointer") // Indicate interactivity
    
    const textSvg = d3.select("#text-container")
    .append("svg")
    .attr("width", width)
    .attr("height", 150)

    function createText(y, text) {
        textSvg.append("text")
            .attr("x", 625)  
            .attr("y", y)  
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#000000")
            .text(text);
    }
    createText(30, "0-9______0-19__________________0-39__________________________________________0-64+______________________________________40-64+________________60-64+_______64-64+")
    createText(60, "left: younger population group, right: older population group")
    createText(90, "population is indicated in circle and purple groups have larger population compared to green circle of same size")
    // Recursive function to draw circles
    function drawCircle(x, y, radius, depth, arrayIndex, textIndex) {
        if (depth === 0 || arrayIndex >= allGroups.length) {
            return; // Stop recursion at base depth
        }
        // || textIndex >= allGroups[arrayIndex].length

        let circleColor = "#afdba4"; // Default color
    if (textIndex % 2 === 0 && textIndex + 1 < allGroups[arrayIndex].length) {
        // Ensure the current index has a neighbor to compare
        if (allGroups[arrayIndex][textIndex] > allGroups[arrayIndex][textIndex+1]) {
            circleColor = "#b1b2e6"; 
        }
    }
      // Draw the circle
        svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radius)
        .attr("fill", circleColor)
        .attr("stroke", "#ffffff");

        const text = allGroups[arrayIndex][textIndex];
        svg.append("text")
            .attr("x", x)
            .attr("y", y - radius + 15) // Center the text vertically
            .attr("text-anchor", "middle")
            .style("fill", "#000000")
            .style("font-size", "12px")
            .text(text);
    
        const newRadius = radius / 2; // Smaller circle radius
        const nextTextIndex = textIndex + 1
        drawCircle(x + radius + newRadius, y, newRadius, depth - 1, arrayIndex + 1, nextTextIndex*2-1); // Right
        drawCircle(x - radius - newRadius, y, newRadius, depth - 1, arrayIndex + 1, (nextTextIndex-1)*2); // Left

        svg.on("click", function () {
            currentDepth = (currentDepth % 5) + 1; // Increment depth and reset
    
            svg.selectAll("*").remove(); // Clear existing elements
    
            // Redraw circles with text based on the new depth
            drawCircle(width / 2, height / 2, 205, currentDepth, 0, 0);
        });
      }
    // Start the recursion
    drawCircle(width / 2, height / 2, 205, 5, 0, 0)
})

