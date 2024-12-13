/*
  Name:        main.js
  Purpose:     Sorts data and creates new instances of imported classes

  Author:      Michelle Liu
  Created:     03-Dec-2024
  Updated:     12-Dec-2024
*/

// Importing classes needed from other files
import { DataProcessor, SearchProcessor, AgeGroupProcessor } from "./data-processor.js";
import { VisualisationProcessor } from "./visualisation-processor.js";

// Object with keys for age groups and values for populations in age groups
const ageSums = { "0-4 years": 0, "5-9 years": 0, "10-14 years": 0, "15-19 years": 0, "20-24 years": 0, "25-29 years": 0, "30-34 years": 0, "35-39 years": 0, "40-44 years": 0, "45-49 years": 0, "50-54 years": 0, "55-59 years": 0, "60-64 years": 0, "50+ years": 0 };

// Loads unicef database csv, checks for errors then, extracts data and parses it
d3.queue().defer(d3.csv, "assets/unicef-data.csv")
.awaitAll(function(error, results) {
    if (error) throw error
    const csvData = results[0]

    // Creates new instances of the classes
    const dataProcessor = new DataProcessor(csvData);
    const uniqueData = dataProcessor.filterData();

    // Sorts and searches through data
    const searchProcessor = new SearchProcessor(uniqueData);
    // Sorts all age groups to go from youngest to oldest
    const sortedUniqueData = dataProcessor.timedQuickSort(uniqueData, "subgroup");
    // Sorts populations of age groups to go from least to most
    const subgroups = uniqueData.map(item => parseFloat(item.population));
    const sortedSubgroups = dataProcessor.bubbleSort(subgroups);
    // Searches for indexes to halve the data each time (based on the age group in the middle)
    const halfIndex = searchProcessor.linearSearch(sortedUniqueData, "5-9 years");
    const quarterIndex = searchProcessor.timedBinarySearch(sortedUniqueData, "20-24 years")
    const eighthIndex = searchProcessor.timedBinarySearch(sortedUniqueData, "10-14 years")
    const sixteenthIndex = searchProcessor.timedBinarySearch(sortedUniqueData, "40-44 years")

    // Adds up populations to get total population
    for (let i = 0; i < sortedUniqueData.length; i++) {
        ageSums[sortedUniqueData[i].subgroup] += parseInt(sortedUniqueData[i].population);
    }
    
    // New instance of grouping class
    const groupProcessor = new AgeGroupProcessor(uniqueData);
    const allGroups = groupProcessor.getGrouping(ageSums);

    allGroups[3].push(126405);
    allGroups[4].push(126405, 126405);

    // New instance of visualisation class and drawing the circles for visualisation
    const visualisation = new VisualisationProcessor("#visualisation", "#text-container");
    visualisation.initialiseSvg();
    visualisation.createText(30, "0-9______0-19__________________0-39__________________________________________0-64+______________________________________40-64+________________60-64+_______64-64+");
    visualisation.createText(60, "left: younger population group, right: older population group");
    visualisation.createText(90, "population is indicated in circle and purple groups have larger population compared to green circle of same size");

    visualisation.drawCircle(625, 215, 205, 5, allGroups, 0, 0);







    
    console.log(sortedSubgroups)
    console.log('Middle Index: '+halfIndex)
    console.log('Quarter Index: '+quarterIndex)
    console.log('Quarter Index: '+eighthIndex)
    console.log('Quarter Index: '+sixteenthIndex)
});
