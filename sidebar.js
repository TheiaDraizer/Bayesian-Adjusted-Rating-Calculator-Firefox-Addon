function cleanNumberInput(value) {
    return value.replace(/\s+/g, '').replace(/,/g, '');
}

function calculateWeightedRating(avgRating, numRatings) {
    const m = 10;
    const C = 3.5;
    const v = numRatings;
    const R = avgRating;
    const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;
    return weightedRating.toFixed(2);
}

function saveTableData() {
    const rows = document.querySelectorAll('#tableBody tr');
    const data = [];
    rows.forEach(row => {
        const linkInput = row.querySelector('input[type="text"].link');
        const avgRatingInput = row.querySelector('input[type="number"].avg-rating');
        const numRatingsInput = row.querySelector('input[type="text"].num-ratings');
        const weightedRating = row.querySelector('td:nth-child(4)').textContent;
        data.push({
            link: linkInput.value,
            avgRating: avgRatingInput.value,
            numRatings: numRatingsInput.value,
            weightedRating,
        });
    });
    browser.storage.local.set({ tableData: data });
}

function loadTableData() {
    browser.storage.local.get('tableData', (result) => {
        const data = result.tableData || [];
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        data.forEach((item) => {
            addRow(item.link, item.avgRating, item.numRatings, item.weightedRating);
        });
        if (tbody.children.length === 0) {
            addRow();
        }
        addInputEventListeners();
        highlightBestRow();
    });
}

function addRow(link = '', avgRating = '', numRatings = '', weightedRating = '-') {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');

    const linkCell = document.createElement('td');
    const linkContainer = document.createElement('div');
    linkContainer.className = 'link-container';
    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.className = 'link';
    linkInput.placeholder = 'Enter name or paste link';
    linkInput.value = link;
    linkContainer.appendChild(linkInput);

    const goButton = document.createElement('button');
    goButton.className = 'go-button';
    goButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
    goButton.addEventListener('click', () => {
        const url = linkInput.value.trim();
        if (url) {
            window.open(url, '_blank');
        }
    });
    linkContainer.appendChild(goButton);
    linkCell.appendChild(linkContainer);
    row.appendChild(linkCell);

    const avgRatingCell = document.createElement('td');
    const avgRatingInput = document.createElement('input');
    avgRatingInput.type = 'number';
    avgRatingInput.step = '0.01';
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
    const clearRowButton = document.createElement('button');
    clearRowButton.className = 'clear-row';
    clearRowButton.innerHTML = '<i class="fas fa-trash"></i>';
    clearRowButton.addEventListener('click', () => {
        row.remove();
        saveTableData();
        highlightBestRow();
    });
    actionCell.appendChild(clearRowButton);
    row.appendChild(actionCell);

    tbody.appendChild(row);
    addInputEventListeners();
    if (tbody.children.length === 1) {
        addRow();
    }
    highlightBestRow();
}

function addInputEventListeners() {
    const inputs = document.querySelectorAll('#tableBody input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculateRatings();
            saveTableData();
            highlightBestRow();
            const tbody = document.getElementById('tableBody');
            const lastRow = tbody.lastElementChild;
            const lastRowInputs = lastRow.querySelectorAll('input');
            const isLastRowFilled = Array.from(lastRowInputs).some(input => input.value.trim() !== '');
            if (isLastRowFilled) {
                addRow();
            }
        });
    });
}

function calculateRatings() {
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        const avgRatingInput = row.querySelector('input.avg-rating');
        const numRatingsInput = row.querySelector('input.num-ratings');
        const avgRating = parseFloat(avgRatingInput.value);
        const numRatings = parseInt(cleanNumberInput(numRatingsInput.value), 10);
        if (!isNaN(avgRating) && !isNaN(numRatings)) {
            const weightedRating = calculateWeightedRating(avgRating, numRatings);
            row.querySelector('td:nth-child(4)').textContent = weightedRating;
        } else {
            row.querySelector('td:nth-child(4)').textContent = '-';
        }
    });
}

function highlightBestRow() {
    const rows = document.querySelectorAll('#tableBody tr');
    let bestRow = null;
    let bestRating = -1;
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
    saveTableData();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTableData();
    document.getElementById('clearAllButton').addEventListener('click', clearAllRows);
    document.getElementById('addRowButton').addEventListener('click', () => {
        addRow();
    });
});
