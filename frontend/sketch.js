let appData = { stars: [], edges: [] };
let revealedEdges = 0;
let isRevealing = false;
let revealTimer = 0;
const EDGE_DELAY = 10;

let bgStars = [];

let nebulaBuffer;

let entryScreen, viewScreen, viewTitle, resetBtn, inp, enterHint;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 350; i++) {
        bgStars.push({
            x: random(width),
            y: random(height),
            size: random(0.5, 2.5),
            drift: random(0.025, 0.14),
            phase: random(TWO_PI),
            twinkleSpeed: random(0.003, 0.012),
        });
    }
    buildNebula();

    entryScreen = document.getElementById('entry-screen');
    viewScreen = document.getElementById('view-screen');
    viewTitle = document.getElementById('view-title');
    resetBtn = document.getElementById('reset-btn');
    inp = document.getElementById('star-input');
    enterHint = document.getElementById('enter-hint');

    inp.addEventListener('input', () => {
        if (inp.value.trim().length > 0) {
            enterHint.classList.add('visible');
        } else {
            enterHint.classList.remove('visible');
        }
    });

    const trigger = () => {
        const txt = inp.value.trim();
        if (txt) fetchAndReveal(txt);
    };
    inp.addEventListener('keypress', e => { if (e.key === 'Enter') trigger(); });
    enterHint.addEventListener('click', trigger);

    resetBtn.addEventListener('click', () => {
        appData = { stars: [], edges: [] };
        revealedEdges = 0;
        isRevealing = false;

        inp.value = '';
        enterHint.classList.remove('visible');

        viewScreen.classList.add('hidden');
        setTimeout(() => {
            entryScreen.classList.remove('hidden');
            inp.focus();
        }, 400);
    });

    inp.focus();
}


function draw() {
    background(3, 2, 13);
    tint(255, 55);
    image(nebulaBuffer, 0, 0);
    noTint();

    noStroke();
    for (let s of bgStars) {
        s.x -= s.drift;
        if (s.x < -2) s.x = width + 2;

        const breath = sin(frameCount * s.twinkleSpeed + s.phase);
        const alpha = map(breath, -1, 1, 20, 190);

        fill(255, 255, 255, alpha);
        circle(s.x, s.y, s.size);
    }

    if (isRevealing && revealedEdges < appData.edges.length) {
        revealTimer++;
        if (revealTimer >= EDGE_DELAY) {
            revealedEdges++;
            revealTimer = 0;
            if (revealedEdges >= appData.edges.length) {
                isRevealing = false;
                revealComplete();
            }
        }
    }

    for (let i = 0; i < revealedEdges; i++) {
        const edge = appData.edges[i];
        const n1 = appData.stars[edge[0]];
        const n2 = appData.stars[edge[1]];

        const x1 = n1.x * width;
        const y1 = n1.y * height;
        const x2 = n2.x * width;
        const y2 = n2.y * height;

        stroke(190, 175, 255, 55);
        strokeWeight(0.8);
        line(x1, y1, x2, y2);
    }

    const revealed = new Set();
    if (appData.stars.length > 0) revealed.add(0);
    for (let i = 0; i < revealedEdges; i++) {
        revealed.add(appData.edges[i][0]);
        revealed.add(appData.edges[i][1]);
    }

    noStroke();
    for (const idx of revealed) {
        const star = appData.stars[idx];
        const sx = star.x * width;
        const sy = star.y * height;

        const r = map(star.size, 0.005, 0.02, 1.5, 4);
        drawingContext.shadowColor = 'rgba(210, 195, 255, 0.95)';
        drawingContext.shadowBlur = r * 20 + sin(frameCount * 0.05) * 2;

        fill(255, 255, 255);
        circle(sx, sy, r * 1.4);

        drawingContext.shadowBlur = 0;

        if (dist(mouseX, mouseY, sx, sy) < 24) {
            drawingContext.shadowColor = 'rgba(220, 210, 255, 0.8)';
            drawingContext.shadowBlur = 12;
            noStroke();
            fill(235, 228, 255, 230);
            textFont('Cinzel, serif');
            textSize(18);
            textAlign(CENTER, BOTTOM);
            text(star.char, sx, sy - 16);
            drawingContext.shadowBlur = 0;
        }
    }
}

async function fetchAndReveal(text) {
    const normalised = text.toLowerCase();
    entryScreen.classList.add('hidden');

    const url = `http://127.0.0.1:8000/api/constellation?text=${encodeURIComponent(normalised)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        appData.stars = data.stars;
        appData.edges = data.edges;

        revealedEdges = 0;
        revealTimer = 0;
        isRevealing = true;
        viewTitle.textContent = normalised;

        console.log(`✦ Mapped "${normalised}" → ${data.stars.length} stars, ${data.edges.length} edges`);
    } catch (err) {
        console.error('Backend fetch failed:', err);
        entryScreen.classList.remove('hidden');
        entryScreen.style.opacity = '';
    }
}

function revealComplete() {
    viewScreen.classList.remove('hidden');
}

function buildNebula() {
    nebulaBuffer = createGraphics(width, height);
    nebulaBuffer.noStroke();

    const layers = [
        { offsetX: 0, offsetY: 0, scale: 600, threshold: 0.50, r: 120, g: 20, b: 180, maxAlpha: 90 },
        { offsetX: 300, offsetY: 150, scale: 500, threshold: 0.51, r: 180, g: 30, b: 80, maxAlpha: 75 },
        { offsetX: 600, offsetY: 400, scale: 700, threshold: 0.50, r: 20, g: 130, b: 170, maxAlpha: 65 },
        { offsetX: 100, offsetY: 700, scale: 450, threshold: 0.52, r: 60, g: 40, b: 200, maxAlpha: 80 },
        { offsetX: 800, offsetY: 200, scale: 550, threshold: 0.53, r: 200, g: 90, b: 30, maxAlpha: 50 },
    ];

    const step = 6;

    for (const layer of layers) {
        for (let x = 0; x < width; x += step) {
            for (let y = 0; y < height; y += step) {
                const n = noise(
                    (x + layer.offsetX) / layer.scale,
                    (y + layer.offsetY) / layer.scale
                );

                if (n > layer.threshold) {
                    const alpha = map(n, layer.threshold, 1.0, 0, layer.maxAlpha);
                    nebulaBuffer.fill(layer.r, layer.g, layer.b, alpha);
                    nebulaBuffer.rect(x, y, step + 1, step + 1);
                }
            }
        }
    }

    nebulaBuffer.filter(BLUR, 18);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    buildNebula();
}
