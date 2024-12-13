/*
  Name:        data-processor.js
  Purpose:     Configures data from database for use in map visualisation

  Author:      Michelle Liu
  Created:     03-Dec-2024
  Updated:     12-Dec-2024
*/

/**
 * @class DataProcessor
 * @description Prepares data for visualisation by sorting dataset from database
 */
    export class DataProcessor {
    /** 
    * @constructor
    * @param {Object} data - csv data accessed from assets folder
    *
    */
    constructor(data) {
        this.data = data;
    }

    filterData(){
        const ageGroups = [];
        for (const row of this.data) {
            const { dimension, estimate, subgroup, setting, population } = row;
            if ((/Age \((10|9) groups\)/.test(dimension) || dimension === "Age (4 groups) (0-17)" || subgroup === "50+ years") && estimate !== "" && subgroup !== "15-17 years") {
                ageGroups.push({ country: setting, dimension, subgroup, population });
            }
        }

        return ageGroups.filter((item, index, self) =>
            index === self.findIndex((val) => (
                val.dimension === item.dimension && val.subgroup === item.subgroup && val.country === item.country && val.population === item.population
            ))
        );
    }

    bubbleSort(arr) {
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

    quickSort(arr, key){
        if (arr.length <= 1) {
            return arr;
        }
        
        // Use the pivot based on the key value
        let pivot = arr[Math.floor(arr.length / 2)];
        let pivotValue = pivot[key];
        
        let left = arr.filter(item => item[key] < pivotValue);
        let middle = arr.filter(item => item[key] === pivotValue);
        let right = arr.filter(item => item[key] > pivotValue);

        return [...this.quickSort(left, key), ...middle, ...this.quickSort(right, key)]

    }

    timedQuickSort(arr, key) {
        console.time('Quick Sort Time');
        const sortedArray = this.quickSort(arr, key);
        console.timeEnd('Quick Sort Time');
        return sortedArray;
    }
}

export class SearchProcessor extends DataProcessor {

    linearSearch(arr, target) {
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

    binarySearchFirst(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        let result = -1; // Initialize result to -1 to indicate not found
    
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
    
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

    timedBinarySearch(arr, target) {
        console.time('Binary Search Time')
        const searchedArray = this.binarySearchFirst(arr, target)
        console.timeEnd('Binary Search Time')
        return searchedArray
    }
}

export class AgeGroupProcessor extends DataProcessor {
    getGrouping(ageSums) {
        const group1 = Object.values(ageSums).reduce((sum, value) => sum + value, 0); // Total sum of all values
        const keys = Object.keys(ageSums); // Get all keys
        const totalKeys = keys.length;
    
        const groups = [[group1]]; // Start with group1
    
        let divisor = 2; // Start with halves for group2
        // let groupIndex = 2; // Track the group number
    
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
            // groupIndex++; // Increment group number
        }
    
        return groups;
    }
}