let currentClue = 0;
let totalClues = 5;
let currentSystem = null;
let chart = null;
let score = 0;
let currentMethod = 'substitution';
let gameHistory = [];
function generateSystem() {
    while(true) {
        const a1 = Math.floor(Math.random() * 5) + 1;
        const b1 = Math.floor(Math.random() * 5) + 1;
        const c1 = Math.floor(Math.random() * 10) + 1;
        const a2 = Math.floor(Math.random() * 5) + 1;
        const b2 = Math.floor(Math.random() * 5) + 1;
        const c2 = Math.floor(Math.random() * 10) + 1;

        if (a1/a2 !== b1/b2) {
            const multiplier1 = a2;
            const multiplier2 = a1;

            const yCoeff = (b1 * multiplier1) - (b2 * multiplier2);
            const yConst = (c1 * multiplier1) - (c2 * multiplier2);
            const y = yConst / yCoeff;
            const x = (c1 - b1 * y) / a1;

            return {
                equations: [
                    `${a1}x + ${b1}y = ${c1}`,
                    `${a2}x + ${b2}y = ${c2}`
                ],
                solution: { x, y },
                coefficients: { a1, b1, c1, a2, b2, c2 }
            };
        }
    }
}

function renderMath() {
    renderMathInElement(document.body, {
        delimiters: [
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false}
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    });
}

function updateProgress() {
    const progress = (score / totalClues) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('score').textContent = `Score: ${score}/${totalClues}`;
}

function showSubstitutionSteps() {
    const {a1, b1, c1, a2, b2, c2} = currentSystem.coefficients;
    const {x, y} = currentSystem.solution;

    const stepsHTML = `
        <div class="question">Solve using substitution:</div>
        <div class="step-card">
            <div class="step-header">Step 1: Solve first equation for x</div>
            <div>\\[${a1}x + ${b1}y = ${c1}\\]</div>
            <div>\\[x = \\frac{${c1} - ${b1}y}{${a1}}\\]</div>
        </div>
        <div class="step-card">
            <div class="step-header">Step 2: Substitute into second equation</div>
            <div>\\[${a2}\\left(\\frac{${c1} - ${b1}y}{${a1}}\\right) + ${b2}y = ${c2}\\]</div>
        </div>
        <div class="step-card">
            <div class="step-header">Step 3: Simplify and solve for y</div>
            <div>\\[\\begin{align*}
                \\frac{${a2}(${c1} - ${b1}y)}{${a1}} + ${b2}y &= ${c2} \\\\
                ${(a2*c1/a1).toFixed(2)} - ${(a2*b1/a1).toFixed(2)}y + ${b2}y &= ${c2} \\\\
                ${(b2 - (a2*b1/a1)).toFixed(2)}y &= ${(c2 - (a2*c1/a1)).toFixed(2)} \\\\
                y &= ${y.toFixed(2)}
            \\end{align*}\\]</div>
        </div>
        <div class="step-card">
            <div class="step-header">Step 4: Substitute y back to find x</div>
            <div>\\[\\begin{align*}
                x &= \\frac{${c1} - ${b1} \\times ${y.toFixed(2)}}{${a1}} \\\\
                x &= \\frac{${c1 - (b1*y).toFixed(2)}}{${a1}} \\\\
                x &= ${x.toFixed(2)}
            \\end{align*}\\]</div>
        </div>
        ${createInteractionField()}
    `;

    document.getElementById('steps-container').innerHTML = stepsHTML;
    renderMath();
    gameHistory[currentClue] = document.getElementById('steps-container').innerHTML;
}

function showEliminationSteps() {
    const {a1, b1, c1, a2, b2, c2} = currentSystem.coefficients;
    const {x, y} = currentSystem.solution;

    const multiplier1 = a2;
    const multiplier2 = a1;
    const yCoeff = (b1 * multiplier1) - (b2 * multiplier2);
    const yConst = (c1 * multiplier1) - (c2 * multiplier2);

    const stepsHTML = `
        <div class="question">Solve using elimination:</div>
        <div class="step-card">
            <div class="step-header">Step 1: Multiply equations</div>
            <div>\\[${a1}x + ${b1}y = ${c1} \\quad (\\times ${multiplier1})\\]</div>
            <div>\\[${a2}x + ${b2}y = ${c2} \\quad (\\times ${multiplier2})\\]</div>
        </div>
        <div class="step-card">
            <div class="step-header">Step 2: Subtract equations</div>
            <div>\\[\\begin{align*}
                (${a1*multiplier1}x + ${b1*multiplier1}y) - (${a2*multiplier2}x + ${b2*multiplier2}y) &= ${c1*multiplier1} - ${c2*multiplier2} \\\\
                ${yCoeff}y &= ${yConst} \\\\
                y &= ${y.toFixed(2)}
            \\end{align*}\\]</div>
        </div>
        <div class="step-card">
            <div class="step-header">Step 3: Substitute back</div>
            <div>\\[\\begin{align*}
                ${a1}x + ${b1}(${y.toFixed(2)}) &= ${c1} \\\\
                ${a1}x + ${(b1*y).toFixed(2)} &= ${c1} \\\\
                x &= ${x.toFixed(2)}
            \\end{align*}\\]</div>
        </div>
        ${createInteractionField()}
    `;

    document.getElementById('steps-container').innerHTML = stepsHTML;
    renderMath();
    gameHistory[currentClue] = document.getElementById('steps-container').innerHTML;
}


function createInteractionField() {
    const {x, y} = currentSystem.solution;
    const useMCQ = Math.random() > 0.5;

    if(useMCQ) {
        const answers = generateMultipleChoice();
        return `
            <div class="question">Select the correct solution:</div>
            <div class="choices-container">
                ${answers.map(a => `
                    <button class="choice-btn" onclick="checkAnswer(${a.x}, ${a.y})">
                        (${a.x.toFixed(2)}, ${a.y.toFixed(2)})
                    </button>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="question">Enter the solution:</div>
        <div class="input-container">
            <input class="input-field" type="number" step="0.01" placeholder="x" id="x-input">
            <span class="math-symbol">,</span>
            <input class="input-field" type="number" step="0.01" placeholder="y" id="y-input">
            <button class="choice-btn" onclick="checkAnswer()">Submit</button>
        </div>
    `;
}

function generateMultipleChoice() {
    const {x, y} = currentSystem.solution;
    const answers = [];

    for(let i = 0; i < 3; i++) {
        answers.push({
            x: x + (Math.random() - 0.5) * 2,
            y: y + (Math.random() - 0.5) * 2
        });
    }
    answers.push({x, y});

    return answers.sort(() => Math.random() - 0.5);
}

function checkAnswer(userX, userY) {
    const {x, y} = currentSystem.solution;
    let isCorrect = false;

    if(typeof userX === 'number' && typeof userY === 'number') {
        isCorrect = Math.abs(userX - x) < 0.01 && Math.abs(userY - y) < 0.01;
    } else {
        const inputX = parseFloat(document.getElementById('x-input').value);
        const inputY = parseFloat(document.getElementById('y-input').value);
        isCorrect = Math.abs(inputX - x) < 0.01 && Math.abs(inputY - y) < 0.01;
    }

    if(isCorrect) {
        score++;
        updateProgress();
        alert(`Correct! Solution is (${x.toFixed(2)}, ${y.toFixed(2)})`);
        showNextClue();
    } else {
        alert(`Incorrect! The correct solution is (${x.toFixed(2)}, ${y.toFixed(2)})`);
    }
}

function showNextClue() {
    currentClue++;
    if(currentClue < totalClues) {
        currentMethod = currentMethod === 'substitution' ? 'elimination' : 'substitution';
        currentSystem = generateSystem();
        updateDisplay();
        currentMethod === 'substitution' ? showSubstitutionSteps() : showEliminationSteps();
    } else {
        document.getElementById('clue-container').innerHTML = `
            <h2>Congratulations! 🎉</h2>
            <p>Perfect score! ${score}/${totalClues} correct answers!</p>
            <div class="action-buttons">
                <button onclick="location.reload()">Play Again</button>
                <button onclick="generatePDF()">Download PDF Report</button>
            </div>`;
    }
}

async function generatePDF() {
    window.html2canvas = html2canvas;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text("Math Scavenger Hunt Report", 10, 20);
    let yPosition = 40;

    // Create temporary visible container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '0';
    tempContainer.style.top = '0';
    tempContainer.style.zIndex = '9999';
    document.body.appendChild(tempContainer);

    try {
        for(let i = 0; i < gameHistory.length; i++) {
            const content = document.createElement('div');
            content.innerHTML = gameHistory[i];
            content.style.width = "190mm";
            content.style.padding = "20px";
            content.style.background = "white";
            tempContainer.appendChild(content);

            const canvas = await html2canvas(content, {
                scale: 2,
                logging: true,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add new page if needed
            if(yPosition + imgHeight > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                yPosition = 20;
            }

            doc.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;

            tempContainer.removeChild(content);
        }

        // Final score
        doc.setFontSize(16);
        doc.text(`Final Score: ${score}/${totalClues}`, 10, yPosition);
        doc.save("math-report.pdf");
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please check the console.');
    } finally {
        document.body.removeChild(tempContainer);
    }
}

function createEquationDataset(a, b, c, color) {
    const range = 20;
    const points = []; // Array to store the data points for the line

    if(b === 0) { // If b is 0, the equation is a vertical line
        const xVal = c/a;  // Calculate the x value where the line intersects the x-axis
        return {
            label: `${a}x + ${b}y = ${c}`,
            data: [{x: xVal, y: -range}, {x: xVal, y: range}], // Data points for the line
            borderColor: color, // Color of the line
            fill: false, // Do not fill the area under the line
            type: 'line', // Specify the chart type as a line
            pointRadius: 0  // Do not display points on the line
        };
    }
// If b is not 0, the equation is a line with a slope
    // Generate data points for the line within the defined range
    for(let x = -range; x <= range; x += 0.5) {
        points.push({x, y: (c - a * x)/b});  // Calculate the y value for each x value
    }

    return {  // Return a dataset for a line with a slope
        label: `${a}x + ${b}y = ${c}`,   // Label for the equation
        data: points,                   // Data points for the line
        borderColor: color,           // Color of the line
        fill: false,             // Do not fill the area
        type: 'line',               // Specify the chart type as a line
        pointRadius: 0,            // Do not display points on the line
        borderWidth: 2            // Set the line width
    };
}

function plotGraph() {
    const ctx = document.getElementById('graph').getContext('2d');
    if(chart) chart.destroy();

    const {x, y} = currentSystem.solution;
    const {a1, b1, c1, a2, b2, c2} = currentSystem.coefficients;

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                createEquationDataset(a1, b1, c1, '#2196F3'),
                createEquationDataset(a2, b2, c2, '#FF9800'),
                {
                    label: 'Solution',
                    data: [{x, y}],
                    backgroundColor: '#4CAF50',
                    pointRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        modifierKey: 'ctrl'
                    }
                }
            },
            scales: {
                x: { type: 'linear' },
                y: { type: 'linear' }
            }
        }
    });
}

function updateDisplay() {
    document.getElementById('equations').innerHTML = `
        <strong>Clue ${currentClue + 1}:</strong><br>
        ${currentSystem.equations[0]}<br>
        ${currentSystem.equations[1]}
    `;
    plotGraph();
}

document.addEventListener('DOMContentLoaded', () => {
    currentSystem = generateSystem();
    updateDisplay();
    showSubstitutionSteps();
});