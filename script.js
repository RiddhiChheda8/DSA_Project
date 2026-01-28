// ==================== GLOBAL VARIABLES ====================
let selectedAlgorithm = 'dijkstra';
let selectedDestination = null;
let currentBST = null;
let currentSort = null;
let animationSpeed = 500;

// ==================== 1. CAMPUS NAVIGATION ====================

// Campus Graph Data
const campusGraph = {
    nodes: {
        "Main Gate": {x: 100, y: 250, icon: "🏛️"},
        "Academic Block": {x: 400, y: 100, icon: "🏫"},
        "Library": {x: 400, y: 250, icon: "📚"},
        "MCA Department": {x: 250, y: 400, icon: "💻"},
        "Cafeteria": {x: 550, y: 400, icon: "🍔"},
        "Sports Complex": {x: 700, y: 250, icon: "⚽"}
    },
    
    edges: {
        "Main Gate": [
            {node: "Library", distance: 150},
            {node: "Academic Block", distance: 200}
        ],
        "Academic Block": [
            {node: "Main Gate", distance: 200},
            {node: "Library", distance: 100}
        ],
        "Library": [
            {node: "Main Gate", distance: 150},
            {node: "Academic Block", distance: 100},
            {node: "MCA Department", distance: 120},
            {node: "Cafeteria", distance: 180},
            {node: "Sports Complex", distance: 200}
        ],
        "MCA Department": [
            {node: "Library", distance: 120},
            {node: "Cafeteria", distance: 160}
        ],
        "Cafeteria": [
            {node: "Library", distance: 180},
            {node: "MCA Department", distance: 160},
            {node: "Sports Complex", distance: 140}
        ],
        "Sports Complex": [
            {node: "Library", distance: 200},
            {node: "Cafeteria", distance: 140}
        ]
    }
};

// ==================== PRIORITY QUEUE FOR DIJKSTRA ====================
class PriorityQueue {
    constructor() {
        this.values = [];
    }
    
    enqueue(node, priority) {
        this.values.push({node, priority});
        this.values.sort((a, b) => a.priority - b.priority);
    }
    
    dequeue() {
        return this.values.shift();
    }
    
    isEmpty() {
        return this.values.length === 0;
    }
}

// ==================== NAVIGATION FUNCTIONS ====================

function initNavigation() {
    
    setTimeout(() => {
        updateUserLocation();
        initializeMap();
    }, 100);
    
    document.getElementById('startLocation').addEventListener('change', function() {
        updateUserLocation();
        document.getElementById('pathLayer').innerHTML = '';
        document.getElementById('algoSteps').innerHTML = `
            <div class="empty-algo">
                <div class="algo-icon">
                    <i class="fas fa-code-branch"></i>
                </div>
                <h3>Algorithm Visualization</h3>
                <p>Find a path to see detailed step-by-step algorithm visualization</p>
                <div class="algo-tips">
                    <div class="tip">
                        <i class="fas fa-1"></i>
                        <span>Select your location and destination</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-2"></i>
                        <span>Choose an algorithm (Dijkstra or BFS)</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-3"></i>
                        <span>Click "Find Shortest Path" to visualize</span>
                    </div>
                </div>
            </div>
        `;
    });

    const algoContainer = document.getElementById('algoSteps');
    if (algoContainer && !algoContainer.innerHTML.trim()) {
        algoContainer.innerHTML = `
            <div class="empty-algo">
                <div class="algo-icon">
                    <i class="fas fa-code-branch"></i>
                </div>
                <h3>Algorithm Visualization</h3>
                <p>Find a path to see detailed step-by-step algorithm visualization</p>
                <div class="algo-tips">
                    <div class="tip">
                        <i class="fas fa-1"></i>
                        <span>Select your location and destination</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-2"></i>
                        <span>Choose an algorithm (Dijkstra or BFS)</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-3"></i>
                        <span>Click "Find Shortest Path" to visualize</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function initializeMap() {
    const buildings = document.querySelectorAll('.building');
    
    buildings.forEach(building => {
        building.addEventListener('mouseenter', function() {
            const shape = this.querySelector('.bldg');
            shape.style.fill = '#e3f2fd';
            shape.style.strokeWidth = '3';
        });
        
        building.addEventListener('mouseleave', function() {
            const shape = this.querySelector('.bldg');
            shape.style.fill = 'white';
            shape.style.strokeWidth = '2';
        });
        
        building.addEventListener('click', function() {
            const buildingName = this.id;
            selectDestination(buildingName);
        });
    });
    
    const userMarker = document.getElementById('userMarker');
    if (userMarker) userMarker.style.opacity = '1';
}

function updateUserLocation() {
    const start = document.getElementById('startLocation').value;
    const userMarker = document.getElementById('userMarker');
    
    if (campusGraph.nodes[start]) {
        const node = campusGraph.nodes[start];
        const userDot = userMarker.querySelector('.user-dot');
        const userPulse = userMarker.querySelector('.user-pulse');
        const userLabel = userMarker.querySelector('.user-label');
        
        if (userDot) {
            userDot.setAttribute('cx', node.x);
            userDot.setAttribute('cy', node.y);
        }
        if (userPulse) {
            userPulse.setAttribute('cx', node.x);
            userPulse.setAttribute('cy', node.y);
        }
        if (userLabel) {
            userLabel.setAttribute('x', node.x);
            userLabel.setAttribute('y', node.y - 25);
            userLabel.textContent = `📍 YOU (${start})`;
        }
    }
}

function selectDestination(destination) {
    selectedDestination = destination;
    document.getElementById('destinationInput').value = destination;
    highlightBuilding(destination);
}

function highlightBuilding(buildingName) {
    document.querySelectorAll('.bldg').forEach(shape => {
        shape.style.fill = 'white';
        shape.style.strokeWidth = '2';
    });
    
    const building = document.getElementById(buildingName);
    if (building) {
        const shape = building.querySelector('.bldg');
        shape.style.fill = '#e3f2fd';
        shape.style.strokeWidth = '3';
        shape.style.animation = 'pulseHighlight 1s ease-in-out 2';
    }
}

// ==================== ALGORITHM IMPLEMENTATIONS ====================

// DIJKSTRA'S ALGORITHM - Correct implementation for weighted graphs
function dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    const visited = new Set();
    const steps = [];
    
    // Initialize
    for (let node in campusGraph.nodes) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    pq.enqueue(start, 0);
    
    while (!pq.isEmpty()) {
        const smallest = pq.dequeue().node;
        
        if (smallest === end) {
            // Reconstruct path
            const path = [];
            let current = end;
            while (current) {
                path.unshift(current);
                current = previous[current];
            }
            
            return {
                path: path.length > 1 ? path : [],
                distance: distances[end],
                visited: steps,
                algorithm: "Dijkstra's Algorithm",
                timeComplexity: "O((V+E) log V)",
                spaceComplexity: "O(V)",
                note: "Finds shortest path in weighted graphs using priority queue"
            };
        }
        
        if (smallest && distances[smallest] !== Infinity) {
            visited.add(smallest);
            steps.push(smallest);
            
            if (campusGraph.edges[smallest]) {
                for (let neighbor of campusGraph.edges[smallest]) {
                    if (!visited.has(neighbor.node)) {
                        const candidate = distances[smallest] + neighbor.distance;
                        
                        if (candidate < distances[neighbor.node]) {
                            distances[neighbor.node] = candidate;
                            previous[neighbor.node] = smallest;
                            pq.enqueue(neighbor.node, candidate);
                        }
                    }
                }
            }
        }
    }
    
    return {
        path: [],
        distance: Infinity,
        visited: steps,
        algorithm: "Dijkstra's Algorithm",
        timeComplexity: "O((V+E) log V)",
        spaceComplexity: "O(V)"
    };
}

// BFS ALGORITHM - Correct implementation for unweighted graphs
function bfs(start, end) {
    const queue = [[start]];
    const visited = new Set([start]);
    const steps = [start];
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === end) {
            // Calculate weighted distance for educational comparison
            const weightedDistance = calculateWeightedDistance(path);
            
            return {
                path: path,
                distance: path.length - 1, // HOP COUNT (correct for BFS)
                weightedDistance: weightedDistance, // For comparison only
                visited: steps,
                algorithm: "BFS Algorithm",
                timeComplexity: "O(V + E)",
                spaceComplexity: "O(V)",
                note: "Finds shortest path in unweighted graphs (minimum hops)"
            };
        }
        
        if (campusGraph.edges[current]) {
            for (let neighbor of campusGraph.edges[current]) {
                if (!visited.has(neighbor.node)) {
                    visited.add(neighbor.node);
                    steps.push(neighbor.node);
                    queue.push([...path, neighbor.node]);
                }
            }
        }
    }
    
    return {
        path: [],
        distance: Infinity,
        visited: steps,
        algorithm: "BFS Algorithm",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    };
}

// Helper function to calculate weighted distance
function calculateWeightedDistance(path) {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const edge = campusGraph.edges[current].find(e => e.node === next);
        if (edge) distance += edge.distance;
    }
    return distance;
}

// ==================== PATH VISUALIZATION ====================

function findPath() {
    const start = document.getElementById('startLocation').value;
    const destInput = document.getElementById('destinationInput').value;
    
    if (!destInput) {
        showNotification('Please enter a destination!', 'error');
        return;
    }
    
    if (!campusGraph.nodes[destInput]) {
        showNotification('Invalid destination! Please select from suggestions.', 'error');
        return;
    }
    
    selectedDestination = destInput;
    const algorithm = document.getElementById('algorithmSelect').value;
    
    // Clear previous
    document.getElementById('pathLayer').innerHTML = '';
    
    // Run algorithm
    let result;
    if (algorithm === 'dijkstra') {
        result = dijkstra(start, selectedDestination);
    } else {
        result = bfs(start, selectedDestination);
    }
    
    // Update UI
    updatePathInfo(result);
    visualizePath(result);
    showAlgorithmSteps(result);
    highlightBuilding(selectedDestination);
}

function updatePathInfo(result) {
    document.getElementById('algoName').textContent = result.algorithm;
    
    // Display appropriate distance info
    if (result.algorithm === "BFS Algorithm") {
        document.getElementById('pathDistance').innerHTML = 
            result.distance === Infinity ? 'No path found' : 
            `${result.distance} <span class="unit">hops</span> ` +
            `<span class="comparison">(${result.weightedDistance}m actual distance)</span>`;
    } else {
        document.getElementById('pathDistance').textContent = 
            result.distance === Infinity ? 'No path found' : 
            `${result.distance} meters`;
    }
    
    document.getElementById('timeComp').textContent = result.timeComplexity;
    document.getElementById('spaceComp').textContent = result.spaceComplexity;
    
    // Update path steps
    const pathSteps = document.getElementById('pathSteps');
    if (result.path.length === 0) {
        pathSteps.innerHTML = '<span class="no-path">🚫 No path available</span>';
    } else {
        pathSteps.innerHTML = result.path.map((step, index) => 
            `<span class="path-step">${index === 0 ? '📍' : index === result.path.length - 1 ? '🏁' : '➡️'} ${step}</span>`
        ).join('');
    }
    
    // Add algorithm note
    const existingNote = document.querySelector('.algorithm-note');
    if (existingNote) existingNote.remove();
    
    if (result.note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'algorithm-note';
        noteElement.innerHTML = `<i class="fas fa-info-circle"></i> ${result.note}`;
        document.querySelector('.results').appendChild(noteElement);
    }
}

function visualizePath(result) {
    const pathLayer = document.getElementById('pathLayer');
    pathLayer.innerHTML = '';
    
    // Draw visited nodes
    result.visited.forEach((location, index) => {
        setTimeout(() => {
            const node = campusGraph.nodes[location];
            if (node) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
                circle.setAttribute('r', '15');
                circle.setAttribute('class', 'visited-circle');
                circle.setAttribute('fill', '#FF9800');
                circle.setAttribute('opacity', '0');
                circle.style.animation = `fadeInScale 0.5s ease-out ${index * 0.2}s forwards`;
                pathLayer.appendChild(circle);
            }
        }, index * 200);
    });
    
    // Draw path
    setTimeout(() => {
        for (let i = 0; i < result.path.length - 1; i++) {
            setTimeout(() => {
                const nodeA = campusGraph.nodes[result.path[i]];
                const nodeB = campusGraph.nodes[result.path[i + 1]];
                
                if (nodeA && nodeB) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', nodeA.x);
                    line.setAttribute('y1', nodeA.y);
                    line.setAttribute('x2', nodeA.x);
                    line.setAttribute('y2', nodeA.y);
                    line.setAttribute('class', 'path-line');
                    line.setAttribute('stroke', '#4CAF50');
                    line.setAttribute('stroke-width', '8');
                    line.setAttribute('stroke-linecap', 'round');
                    line.style.opacity = '0';
                    pathLayer.appendChild(line);
                    
                    setTimeout(() => {
                        line.style.opacity = '1';
                        line.setAttribute('x2', nodeB.x);
                        line.setAttribute('y2', nodeB.y);
                        line.style.transition = 'all 1s ease-out';
                    }, 100);
                }
            }, i * 600);
        }
    }, result.visited.length * 200);
}

function showAlgorithmSteps(result) {
    const container = document.getElementById('algoSteps');
    container.innerHTML = '';
    
    if (result.path.length === 0) {
        container.innerHTML = `
            <div class="no-path-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h4>No Path Found</h4>
                <p>Unable to find a path from ${document.getElementById('startLocation').value} to ${selectedDestination}</p>
            </div>
        `;
        return;
    }
    
    // Create header
    const header = document.createElement('div');
    header.className = 'algo-header';
    header.innerHTML = `
        <h4><i class="fas fa-project-diagram"></i> ${result.algorithm} Steps</h4>
        <div class="algo-stats">
            <span><i class="fas fa-shoe-prints"></i> ${result.visited.length} nodes visited</span>
            <span><i class="fas fa-route"></i> ${result.path.length} steps in path</span>
        </div>
    `;
    container.appendChild(header);
    
    // Create steps container
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-grid';
    
    // Add visited nodes
    const visitedSection = document.createElement('div');
    visitedSection.className = 'step-section';
    visitedSection.innerHTML = `
        <h5><i class="fas fa-map-marker-alt"></i> Visited Nodes</h5>
        <div class="nodes-list">
            ${result.visited.map((node, index) => `
                <div class="node-item" style="animation-delay: ${index * 0.1}s">
                    <span class="node-index">${index + 1}</span>
                    <span class="node-name">${node}</span>
                    <span class="node-icon">${campusGraph.nodes[node]?.icon || '📍'}</span>
                </div>
            `).join('')}
        </div>
    `;
    stepsContainer.appendChild(visitedSection);
    
    // Add path
    const pathSection = document.createElement('div');
    pathSection.className = 'step-section';
    pathSection.innerHTML = `
        <h5><i class="fas fa-flag-checkered"></i> Final Path</h5>
        <div class="path-visual">
            ${result.path.map((node, index) => `
                <div class="path-step-visual ${index === 0 ? 'start' : index === result.path.length - 1 ? 'end' : ''}" 
                     style="animation-delay: ${index * 0.2}s">
                    <div class="step-circle">${index === 0 ? 'S' : index === result.path.length - 1 ? 'E' : index}</div>
                    <div class="step-info">
                        <div class="step-name">${node}</div>
                        <div class="step-icon">${campusGraph.nodes[node]?.icon || '📍'}</div>
                    </div>
                    ${index < result.path.length - 1 ? '<div class="step-arrow">→</div>' : ''}
                </div>
            `).join('')}
        </div>
    `;
    stepsContainer.appendChild(pathSection);
    
    container.appendChild(stepsContainer);
    
    // Add complexity info
    const complexity = document.createElement('div');
    complexity.className = 'complexity-info';
    complexity.innerHTML = `
        <h5><i class="fas fa-chart-line"></i> Algorithm Analysis</h5>
        <div class="complexity-grid">
            <div class="complexity-item">
                <div class="complexity-label">Time Complexity</div>
                <div class="complexity-value">${result.timeComplexity}</div>
            </div>
            <div class="complexity-item">
                <div class="complexity-label">Space Complexity</div>
                <div class="complexity-value">${result.spaceComplexity}</div>
            </div>
            <div class="complexity-item">
                <div class="complexity-label">Path Length</div>
                <div class="complexity-value">${result.algorithm === "BFS Algorithm" ? result.distance + " hops" : result.distance + "m"}</div>
            </div>
        </div>
    `;
    container.appendChild(complexity);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== 2. BINARY SEARCH TREE ====================

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
        this.id = `node-${value}-${Date.now()}`;
    }
}

class EnhancedBST {
    constructor() {
        this.root = null;
        this.nodeCount = 0;
        this.traversalSteps = [];
        this.init();
    }
    
    init() {
        this.updateVisualization();
        this.addTraversalControls();
    }
    
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (!this.root) {
            this.root = newNode;
            newNode.x = 400;
            newNode.y = 80;
        } else {
            this._insertNode(this.root, newNode);
        }
        
        this.nodeCount++;
        this.updateVisualization();
        this.showMessage(`Value ${value} inserted successfully!`, 'success');
        return newNode;
    }
    
    _insertNode(currentNode, newNode, depth = 1) {
        if (newNode.value < currentNode.value) {
            if (!currentNode.left) {
                currentNode.left = newNode;
                newNode.x = currentNode.x - (200 / depth);
                newNode.y = currentNode.y + 100;
            } else {
                this._insertNode(currentNode.left, newNode, depth + 1);
            }
        } else {
            if (!currentNode.right) {
                currentNode.right = newNode;
                newNode.x = currentNode.x + (200 / depth);
                newNode.y = currentNode.y + 100;
            } else {
                this._insertNode(currentNode.right, newNode, depth + 1);
            }
        }
    }
    
    search(value) {
        this.clearHighlights();
        const found = this._searchNode(this.root, value);
        
        if (found) {
            this.highlightNode(found, 'found');
            this.showMessage(`Value ${value} found!`, 'success');
            return true;
        } else {
            this.showMessage(`Value ${value} not found!`, 'error');
            return false;
        }
    }
    
    _searchNode(node, value) {
        if (!node) return null;
        
        this.highlightNode(node, 'searching');
        
        if (value === node.value) {
            return node;
        }
        
        if (value < node.value) {
            this.highlightNode(node, 'going-left');
            return this._searchNode(node.left, value);
        } else {
            this.highlightNode(node, 'going-right');
            return this._searchNode(node.right, value);
        }
    }
    
    async inorderTraversal() {
        this.clearHighlights();
        this.traversalSteps = [];
        this._inorder(this.root);
        await this.animateTraversalSteps('inorder');
    }
    
    _inorder(node) {
        if (!node) return;
        this._inorder(node.left);
        this.traversalSteps.push(node);
        this._inorder(node.right);
    }
    
    async preorderTraversal() {
        this.clearHighlights();
        this.traversalSteps = [];
        this._preorder(this.root);
        await this.animateTraversalSteps('preorder');
    }
    
    _preorder(node) {
        if (!node) return;
        this.traversalSteps.push(node);
        this._preorder(node.left);
        this._preorder(node.right);
    }
    
    async postorderTraversal() {
        this.clearHighlights();
        this.traversalSteps = [];
        this._postorder(this.root);
        await this.animateTraversalSteps('postorder');
    }
    
    _postorder(node) {
        if (!node) return;
        this._postorder(node.left);
        this._postorder(node.right);
        this.traversalSteps.push(node);
    }
    
    async animateTraversalSteps(type) {
        for (let i = 0; i < this.traversalSteps.length; i++) {
            const node = this.traversalSteps[i];
            this.highlightNode(node, 'traversal');
            await this.sleep(animationSpeed / 2);
            this.resetNodeColor(node);
        }
        
        this.showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal completed!`, 'info');
    }
    
    highlightNode(node, state) {
        const element = document.querySelector(`.treeNode[data-id="${node.id}"]`);
        if (element) {
            element.classList.remove('searching', 'found', 'going-left', 'going-right', 'traversal');
            element.classList.add(state);
        }
    }
    
    resetNodeColor(node) {
        const element = document.querySelector(`.treeNode[data-id="${node.id}"]`);
        if (element) {
            element.classList.remove('searching', 'found', 'going-left', 'going-right', 'traversal');
        }
    }
    
    clearHighlights() {
        document.querySelectorAll('.treeNode').forEach(node => {
            node.classList.remove('searching', 'found', 'going-left', 'going-right', 'traversal');
        });
    }
    
    showMessage(message, type) {
        const messageDiv = document.getElementById('bstMessage');
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = `bst-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateVisualization() {
        const container = document.getElementById('bstContainer');
        
        if (!this.root) {
            container.innerHTML = `
                <div class="empty-bst">
                    <i class="fas fa-tree"></i>
                    <h3>Empty Binary Search Tree</h3>
                    <p>Insert values using the controls above to build the tree</p>
                    <div class="sample-values">
                        <p><strong>Try these values:</strong></p>
                        <div class="sample-btns">
                            <button class="sample-btn" onclick="insertSample([50,30,70,20,40,60,80])">Sample 1</button>
                            <button class="sample-btn" onclick="insertSample([100,50,150,25,75,125,175])">Sample 2</button>
                            <button class="sample-btn" onclick="insertSample([45,23,67,12,34,56,89])">Sample 3</button>
                        </div>
                    </div>
                </div>
                <div id="bstMessage" class="bst-message"></div>
            `;
            document.getElementById('treeHeight').textContent = '0';
            document.getElementById('nodeCount').textContent = '0';
            return;
        }
        
        container.innerHTML = '<div id="bstMessage" class="bst-message"></div>';
        
        const positions = [];
        this.calculatePositions(this.root, container.offsetWidth / 2, 80, 200, positions);
        
        positions.forEach(pos => {
            if (pos.parentX !== null && pos.parentY !== null) {
                const line = document.createElement('div');
                line.className = 'treeLine';
                
                const dx = pos.x - pos.parentX;
                const dy = pos.y - pos.parentY;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                line.style.width = `${length}px`;
                line.style.left = `${pos.parentX}px`;
                line.style.top = `${pos.parentY}px`;
                line.style.transform = `rotate(${angle}deg)`;
                line.style.transformOrigin = '0 0';
                container.appendChild(line);
            }
        });
        
        positions.forEach(pos => {
            const node = document.createElement('div');
            node.className = 'treeNode';
            node.dataset.id = pos.id;
            node.innerHTML = `
                <div class="node-value">${pos.value}</div>
                <div class="node-info">
                    <small>${pos.side || 'root'}</small>
                </div>
            `;
            node.style.left = `${pos.x - 30}px`;
            node.style.top = `${pos.y - 30}px`;
            container.appendChild(node);
        });
        
        document.getElementById('treeHeight').textContent = this.getHeight();
        document.getElementById('nodeCount').textContent = this.nodeCount;
    }
    
    calculatePositions(node, x, y, offset, positions = [], parentX = null, parentY = null, side = null, depth = 1) {
        if (!node) return;
        
        node.x = x;
        node.y = y;
        
        positions.push({
            value: node.value,
            x: x,
            y: y,
            parentX: parentX,
            parentY: parentY,
            id: node.id,
            side: side
        });
        
        if (node.left) {
            this.calculatePositions(node.left, x - (offset / depth), y + 100, offset, positions, x, y, 'left', depth + 1);
        }
        
        if (node.right) {
            this.calculatePositions(node.right, x + (offset / depth), y + 100, offset, positions, x, y, 'right', depth + 1);
        }
    }
    
    getHeight(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
    
    clear() {
        this.root = null;
        this.nodeCount = 0;
        this.updateVisualization();
        this.showMessage('BST cleared!', 'info');
    }
    
    addTraversalControls() {
        const container = document.querySelector('.bst-controls');
        if (!container.querySelector('.traversal-buttons')) {
            const traversalDiv = document.createElement('div');
            traversalDiv.className = 'traversal-buttons';
            traversalDiv.innerHTML = `
                <button class="btn btn-traversal traversal-btn active" data-type="inorder" onclick="performTraversal('inorder')">
                    <i class="fas fa-sort-amount-down"></i> Inorder
                </button>
                <button class="btn btn-traversal traversal-btn" data-type="preorder" onclick="performTraversal('preorder')">
                    <i class="fas fa-sort-amount-up"></i> Preorder
                </button>
                <button class="btn btn-traversal traversal-btn" data-type="postorder" onclick="performTraversal('postorder')">
                    <i class="fas fa-sort-amount-down-alt"></i> Postorder
                </button>
            `;
            container.appendChild(traversalDiv);
        }
    }
}

// ==================== 3. QUICK SORT ====================

class QuickSortVisualizer {
    constructor() {
        this.array = [];
        this.comparisons = 0;
        this.isSorting = false;
        this.arraySize = 20;
        this.generateArray();
    }
    
    generateArray() {
        this.array = Array.from({length: this.arraySize}, () => 
            Math.floor(Math.random() * 91) + 10
        );
        this.comparisons = 0;
        this.updateDisplay();
        this.updateInfo();
    }
    
    changeSize(size) {
        this.arraySize = size;
        this.generateArray();
    }
    
    async sort() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.comparisons = 0;
        const startTime = Date.now();
        
        await this._quickSort(0, this.array.length - 1);
        
        const bars = document.querySelectorAll('.arrayBar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'pivot');
            bar.classList.add('sorted');
        });
        
        this.isSorting = false;
        const timeTaken = Date.now() - startTime;
        document.getElementById('sortTime').textContent = `${timeTaken}ms`;
        this.showMessage(`Sorted in ${timeTaken}ms with ${this.comparisons} comparisons!`, 'success');
    }
    
    async _quickSort(start, end) {
        if (start >= end || !this.isSorting) return;
        
        const pivotIndex = await this._partition(start, end);
        
        await this._quickSort(start, pivotIndex - 1);
        await this._quickSort(pivotIndex + 1, end);
        
        for (let i = start; i <= end; i++) {
            this.markBar(i, 'sorted');
        }
        await this.sleep(100);
    }
    
    async _partition(start, end) {
        const pivotValue = this.array[end];
        let pivotIndex = start;
        
        this.markBar(end, 'pivot');
        await this.sleep(300);
        
        for (let i = start; i < end; i++) {
            this.comparisons++;
            this.updateInfo();
            
            this.markBar(i, 'comparing');
            await this.sleep(200);
            
            if (this.array[i] < pivotValue) {
                await this.animateSwap(i, pivotIndex);
                pivotIndex++;
            }
            
            this.markBar(i, '');
            await this.sleep(50);
        }
        
        await this.animateSwap(pivotIndex, end);
        this.markBar(pivotIndex, 'sorted');
        this.markBar(end, '');
        
        return pivotIndex;
    }
    
    async animateSwap(i, j) {
        if (i === j) return;
        
        this.markBar(i, 'swapping');
        this.markBar(j, 'swapping');
        await this.sleep(300);
        
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        this.updateDisplay();
        await this.sleep(300);
        
        this.markBar(i, '');
        this.markBar(j, '');
    }
    
    markBar(index, className) {
        const bars = document.querySelectorAll('.arrayBar');
        if (bars[index]) {
            bars[index].className = 'arrayBar';
            if (className) {
                bars[index].classList.add(className);
            }
        }
    }
    
    updateDisplay() {
        const container = document.getElementById('arrayContainer');
        container.innerHTML = '';
        
        const maxVal = Math.max(...this.array);
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'arrayBar';
            bar.style.height = `${(value / maxVal) * 180}px`;
            bar.title = `Value: ${value} | Index: ${index}`;
            
            if (this.arraySize <= 30) {
                const label = document.createElement('div');
                label.className = 'bar-label';
                label.textContent = value;
                label.style.color = 'white';
                label.style.fontSize = '10px';
                label.style.textAlign = 'center';
                label.style.marginTop = '5px';
                bar.appendChild(label);
            }
            
            container.appendChild(bar);
        });
    }
    
    updateInfo() {
        document.getElementById('comparisonCount').textContent = this.comparisons;
    }
    
    showMessage(message, type) {
        const messageDiv = document.getElementById('sortMessage');
        if (!messageDiv) {
            const container = document.querySelector('.sort-controls');
            const div = document.createElement('div');
            div.id = 'sortMessage';
            div.className = 'sort-message';
            container.appendChild(div);
        }
        
        const messageDivActual = document.getElementById('sortMessage');
        messageDivActual.textContent = message;
        messageDivActual.className = `sort-message ${type}`;
        
        setTimeout(() => {
            messageDivActual.style.display = 'none';
        }, 3000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    reset() {
        this.isSorting = false;
        this.generateArray();
        this.showMessage('Array reset!', 'info');
    }
}

// ==================== INITIALIZE EVERYTHING ====================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    currentBST = new EnhancedBST();
    currentSort = new QuickSortVisualizer();
    
    const sizeSlider = document.getElementById('arraySize');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', function() {
            document.getElementById('sizeValue').textContent = this.value;
        });
    }
});

// ==================== BST FUNCTIONS ====================

async function insertBST() {
    const input = document.getElementById('bstValue');
    const value = parseInt(input.value);
    
    if (!isNaN(value) && value >= 1 && value <= 100) {
        await currentBST.insert(value);
        input.value = '';
        input.focus();
    } else {
        alert('Please enter a valid number between 1 and 100');
    }
}

async function searchBST() {
    const input = document.getElementById('bstValue');
    const value = parseInt(input.value);
    
    if (!isNaN(value)) {
        await currentBST.search(value);
        input.focus();
    } else {
        alert('Please enter a valid number to search');
    }
}

function clearBST() {
    if (confirm('Are you sure you want to clear the entire BST?')) {
        currentBST.clear();
    }
}

async function insertSample(values) {
    for (const val of values) {
        await currentBST.insert(val);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    document.getElementById('bstValue').value = '';
}

async function performTraversal(type) {
    document.querySelectorAll('.traversal-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    switch(type) {
        case 'inorder':
            await currentBST.inorderTraversal();
            break;
        case 'preorder':
            await currentBST.preorderTraversal();
            break;
        case 'postorder':
            await currentBST.postorderTraversal();
            break;
    }
}

// ==================== QUICK SORT FUNCTIONS ====================

function generateArray() {
    currentSort.generateArray();
}

function startSorting() {
    currentSort.sort();
}

function resetSorting() {
    currentSort.reset();
}

function changeArraySize() {
    const size = parseInt(document.getElementById('arraySize').value);
    currentSort.changeSize(size);
}