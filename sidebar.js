let minRating = 0;
let maxRating = 10;

function calculateBayesianLowerBound(avgRating, numRatings, globalAvg) {
    const C = 100;
    const m = C / Math.sqrt(numRatings);
    const Z = 1.96;
    const maxRating = 10;

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
}

function validateAverageRating(input, min = minRating, max = maxRating) {
    let value = input.value.trim();
    value = value.replace(/\s+/g, '');
    value = value.replace(/[^0-9.]/g, '');
    value = value.replace(/(\..*)\./g, '$1');
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < min || numericValue > max) {
        value = '';
    }
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
} function addRow(link = '', avgRating = '', numRatings = '', weightedRating = '-') {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');

    const linkCell = document.createElement('td');
    const linkContainer = document.createElement('div');
    linkContainer.className = 'link-container';

    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.placeholder = 'Enter URL';
    linkInput.className = 'link-input';
    linkInput.value = link;
    linkContainer.appendChild(linkInput);

    const goButton = document.createElement('button');
    goButton.className = 'go-button';
    goButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
    goButton.addEventListener('click', () => {
        const url = linkInput.value.trim();
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                window.open(`https://${url}`, '_blank');
            } else {
                window.open(url, '_blank');
            }
        } else {
            alert('Please enter a valid URL.');
        }
    });
    linkContainer.appendChild(goButton);

    linkCell.appendChild(linkContainer);
    row.appendChild(linkCell);

    const avgRatingCell = document.createElement('td');
    const avgRatingInput = document.createElement('input');
    avgRatingInput.type = 'text';
    avgRatingInput.className = 'avg-rating';
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
    const containerForClearRowButton = document.createElement('div');
    containerForClearRowButton.className = 'container-for-clear-row-button';
    actionCell.appendChild(containerForClearRowButton);

    const clearRowButton = document.createElement('button');
    clearRowButton.className = 'clear-row';
    clearRowButton.textContent = 'X';
    clearRowButton.addEventListener('click', () => {
        row.remove();
        calculateRatings();
        highlightBestRow();
    });
    containerForClearRowButton.appendChild(clearRowButton);
    actionCell.appendChild(containerForClearRowButton);

    row.appendChild(actionCell);

    tbody.appendChild(row);

    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {

            calculateRatings();
            highlightBestRow();
        });
    });

    if (row === tbody.lastElementChild) {
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (row === tbody.lastElementChild) {
                    addRow();
                }
            });
        });
    }

    highlightBestRow();
}

function calculateRatings() {
    const globalAvg = calculateGlobalAverage();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');
        const avgRating = parseFloat(validateAverageRating(avgRatingInput, minRating, maxRating));
        const numRatings = parseInt(validateNumberOfRatings(numRatingsInput), 10);

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
    let highestRating = -Infinity;

    rows.forEach(row => {
        const weightedRatingCell = row.querySelector('td:nth-child(4)');
        const weightedRating = parseFloat(weightedRatingCell.textContent);

        if (!isNaN(weightedRating) && weightedRating > highestRating) {
            highestRating = weightedRating;
            bestRow = row;
        }
    });

    rows.forEach(row => {
        row.style.backgroundColor = '';
        const weightedRatingCell = row.querySelector('td:nth-child(4)');
        if (weightedRatingCell) {
            weightedRatingCell.style.color = '';
        }
    });

    if (bestRow) {
        bestRow.style.backgroundColor = '#B1BCC4FF';

        const weightedRatingCell = bestRow.querySelector('td:nth-child(4)');
        if (weightedRatingCell) {
            weightedRatingCell.style.color = '#000000';
            weightedRatingCell.style.fontWeight = 'bold';
        }
    }
}


function clearAllRows() {
    const confirmDelete = confirm('Are you sure you want to delete all ratings?');
    if (confirmDelete) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        addRow();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTableData();

    document.getElementById('clearAllButton').addEventListener('click', clearAllRows);
    document.getElementById('minRatingInput').value = minRating;
    document.getElementById('maxRatingInput').value = maxRating;
    const tbody = document.getElementById('tableBody');
    tbody.addEventListener('input', () => {
        saveTableData();
    });
    document.getElementById('addRowButton').addEventListener('click', () => {
        addRow();
        saveTableData();
    });
    const copyAllButton = document.getElementById('copyAllButton');
    if (copyAllButton) {
        copyAllButton.addEventListener('click', copyAllInfo);
    }
    document.getElementById('update-possible-ratings').addEventListener('click', updateRatingsRange);

});


function copyAllInfo() {
    const tableData = [];
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const linkInput = row.querySelector('input.link-input');
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');
        const weightedRatingCell = row.querySelector('td:nth-child(4)');

        if (linkInput && avgRatingInput && numRatingsInput && weightedRatingCell) {
            tableData.push({
                link: linkInput.value.trim(),
                avgRating: avgRatingInput.value.trim(),
                numRatings: numRatingsInput.value.trim(),
                weightedRating: weightedRatingCell.textContent.trim(),
            });
        }
    });

    const textToCopy = tableData
        .map(item => `${item.link},${item.avgRating},${item.numRatings},${item.weightedRating}`)
        .join('\n');

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log('Copied all info to clipboard');
                alert('All info copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy all info:', err);
                alert('Failed to copy info to clipboard.');
            });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Copied all info to clipboard');
                alert('All info copied to clipboard!');
            } else {
                throw new Error('Failed to copy text.');
            }
        } catch (err) {
            console.error('Failed to copy all info:', err);
            alert('Failed to copy info to clipboard.');
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
function loadTableData() {
    const data = JSON.parse(localStorage.getItem('tableData')) || [];
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        addRow(item.link, item.avgRating, item.numRatings, item.weightedRating);
    });

    if (tbody.childElementCount === 0) {
        addRow();
    }
}

function saveTableData() {
    const rows = document.querySelectorAll('#tableBody tr');
    const data = [];
    rows.forEach(row => {
        const linkInput = row.querySelector('input.link-input');
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');
        const weightedRatingCell = row.querySelector('td:nth-child(4)');

        if (linkInput && avgRatingInput && numRatingsInput && weightedRatingCell) {
            data.push({
                link: linkInput.value,
                avgRating: avgRatingInput.value,
                numRatings: numRatingsInput.value,
                weightedRating: weightedRatingCell.textContent,
            });
        }
    });
    localStorage.setItem('tableData', JSON.stringify(data));
}
