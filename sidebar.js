let minRating = 0;
let maxRating = 10;

function calculateBayesianLowerBound(avgRating, numRatings, globalAvg, confidence = 0.95) {
    const m = 10;
    const Z = 1.96;
    const alpha = avgRating * numRatings + globalAvg * m;
    const beta = (maxRating - avgRating) * numRatings + (maxRating - globalAvg) * m;
    const stdDev = Math.sqrt((alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1)));
    const lowerBound = (alpha / (alpha + beta)) - (Z * stdDev);
    return lowerBound.toFixed(2);
}

function calculateGlobalAverage() {
    const rows = document.querySelectorAll('#tableBody tr');
    let totalRatings = 0;
    let totalWeight = 0;
    rows.forEach(row => {
        const avgRating = getAvgRatingFromRow(row);
        const numRatings = getNumRatingsFromRow(row);
        if (!isNaN(avgRating) && !isNaN(numRatings) && numRatings > 0) {
            totalRatings += avgRating * numRatings;
            totalWeight += numRatings;
        }
    });
    return totalWeight > 0 ? totalRatings / totalWeight : (minRating + maxRating) / 2;
}

function getAvgRatingFromRow(row) {
    const avgRatingInput = row.querySelector('input.avg-rating');
    console.log(avgRatingInput + ' avg rating input');
    return validateAverageRating(avgRatingInput, minRating, maxRating);
}

function getNumRatingsFromRow(row) {
    const numRatingsInput = row.querySelector('input.num-ratings');
    return validateNumberOfRatings(numRatingsInput);
}

function validateNumberOfRatings(input) {
    let value = input.value.trim().replace(/\s+/g, '').replace(/,/g, '').replace(/[^0-9]/g, '');
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) {
        value = '';
    }
    if (input.value !== value) {
        input.value = value;
    }
    return numericValue;
} function validateAverageRating(input, min = minRating, max = maxRating) {
    let value = input.value.trim();

    // Remove all whitespace
    value = value.replace(/\s+/g, '');
    value = value.replace(/[^0-9.]/g, '');
    value = value.replace(/(\..*)\./g, '$1'); // Remove extra decimal points

    console.log(value + ' after cleaning');

    const numericValue = parseFloat(value);

    console.log(numericValue + ' parsed average');



    // Validate the numeric value against the min and max range
    if (isNaN(numericValue) || numericValue < min || numericValue > max) {
        value = '';
    }

    // Update the input value if it was modified
    if (input.value !== value) {
        input.value = value;
    }

    return numericValue;
}

function updateRatingsRange() {
    const minRatingInput = document.getElementById('minRatingInput');
    const maxRatingInput = document.getElementById('maxRatingInput');
    const newMinRating = parseFloat(minRatingInput.value);
    const newMaxRating = parseFloat(maxRatingInput.value);

    if (isNaN(newMinRating) || isNaN(newMaxRating) || newMinRating >= newMaxRating) {
        alert("Invalid range: Min Rating must be less than Max Rating.");
        return;
    }

    minRating = newMinRating;
    maxRating = newMaxRating;

    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        const avgRatingInput = row.querySelector('input.avg-rating');
        avgRatingInput.min = minRating;
        avgRatingInput.max = maxRating;
        validateAverageRating(avgRatingInput, minRating, maxRating);
    });

    calculateRatings();
    highlightBestRow();
}
function addRow(link = '', avgRating = '', numRatings = '', weightedRating = '-') {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');

    const linkCell = document.createElement('td');
    const linkContainer = document.createElement('div');
    linkContainer.className = 'link-container';
    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.placeholder = 'Enter URL';
    linkInput.className = 'link-input';
    row.appendChild(linkInput);
    linkContainer.appendChild(linkInput);

    const goButton = document.createElement('button');
    goButton.className = 'go-button';
    goButton.textContent = 'Go';


    goButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (!linkInput) {
            console.error('linkInput is not defined or null.');
            return;
        }

        const url = linkInput.value.trim();

        console.log('URL:', url);

        if (url) {
            window.open(url, '_blank');
        } else {
            console.warn('No URL provided.');
        }
    });


    linkContainer.appendChild(goButton);
    linkCell.appendChild(linkContainer);
    row.appendChild(linkCell);

    const avgRatingCell = document.createElement('td');
    const avgRatingInput = document.createElement('input');
    avgRatingInput.type = 'text';
    // avgRatingInput.step = '0.01';
    avgRatingInput.className = 'avg-rating';
    // avgRatingInput.min = minRating;
    // avgRatingInput.max = maxRating;
    avgRatingInput.value = avgRating;
    avgRatingCell.appendChild(avgRatingInput);
    row.appendChild(avgRatingCell);

    const numRatingsCell = document.createElement('td');
    const numRatingsInput = document.createElement('input');
    numRatingsInput.type = 'text';
    numRatingsInput.className = 'num-ratings';
    numRatingsInput.value = numRatings;
    numRatingsCell.appendChild(numRatingsInput);
    row.appendChild(numRatingsCell);

    const weightedRatingCell = document.createElement('td');
    weightedRatingCell.textContent = weightedRating;
    row.appendChild(weightedRatingCell);

    const actionCell = document.createElement('td');
    const clearRowButton = document.createElement('button');
    clearRowButton.className = 'clear-row';
    clearRowButton.textContent = 'X';
    clearRowButton.addEventListener('click', () => {
        row.remove();
        calculateRatings();
        highlightBestRow();
    });
    actionCell.appendChild(clearRowButton);
    row.appendChild(actionCell);

    tbody.appendChild(row);

    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculateRatings();
            highlightBestRow();
            // const lastRow = tbody.lastElementChild;
            // const lastRowInputs = lastRow.querySelectorAll('input');
            // if (Array.from(lastRowInputs).every(input => input.value.trim() !== '')) {
            //     addRow();
            // }
        });
    });

    highlightBestRow();
}
function calculateRatings() {
    const globalAvg = calculateGlobalAverage();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');

        console.log('Avg Rating Input:', avgRatingInput.value); // Debug: Log avg rating input
        console.log('Num Ratings Input:', numRatingsInput.value); // Debug: Log num ratings input

        const avgRating = parseFloat(validateAverageRating(avgRatingInput, minRating, maxRating));
        const numRatings = parseInt(validateNumberOfRatings(numRatingsInput), 10);

        console.log('Validated Avg Rating:', avgRating); // Debug: Log validated avg rating
        console.log('Validated Num Ratings:', numRatings); // Debug: Log validated num ratings

        if (!isNaN(avgRating) && !isNaN(numRatings) && numRatings > 0) {
            const weightedRating = calculateBayesianLowerBound(avgRating, numRatings, globalAvg);
            row.querySelector('td:nth-child(4)').textContent = weightedRating;
        } else {
            row.querySelector('td:nth-child(4)').textContent = '-';
        }
    });
}

function highlightBestRow() {
    const rows = document.querySelectorAll('#tableBody tr');
    let bestRow = null;
    let bestRating = -Infinity;

    rows.forEach(row => {
        const weightedRatingCell = row.querySelector('td:nth-child(4)');
        const weightedRating = parseFloat(weightedRatingCell.textContent);
        if (!isNaN(weightedRating) && weightedRating > bestRating) {
            bestRating = weightedRating;
            bestRow = row;
        }
    });

    rows.forEach(row => {
        row.style.backgroundColor = '';
    });

    if (bestRow) {
        bestRow.style.backgroundColor = '#e6ffe6';
    }
}

function clearAllRows() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    addRow();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTableData();

    document.getElementById('addRowButton').addEventListener('click', addRow);
    document.getElementById('clearAllButton').addEventListener('click', clearAllRows);
    document.getElementById('updateRatingsButton').addEventListener('click', updateRatingsRange);

    document.getElementById('minRatingInput').value = minRating;
    document.getElementById('maxRatingInput').value = maxRating;

    const tbody = document.getElementById('tableBody');
    if (tbody.childElementCount === 0) {
        addRow();
    }
});

function loadTableData() {
    browser.storage.local.get('tableData').then(result => {
        const data = result.tableData || [];
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        data.forEach(item => {
            addRow(item.link, item.avgRating, item.numRatings, item.weightedRating);
        });
    });
}

function saveTableData() {
    const rows = document.querySelectorAll('#tableBody tr');
    const data = [];
    rows.forEach(row => {
        const linkInput = row.querySelector('input.link');
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');
        const weightedRatingCell = row.querySelector('td:nth-child(4)');
        data.push({
            link: linkInput.value,
            avgRating: avgRatingInput.value,
            numRatings: numRatingsInput.value,
            weightedRating: weightedRatingCell.textContent,
        });
    });
    browser.storage.local.set({ tableData: data });
}
