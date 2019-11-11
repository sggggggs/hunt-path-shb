async function getData() {
    return await (await fetch("./src/paths.json")).json();
}

function loadTemplate(templateId) {
    let template = document.getElementById(templateId);
    return template.content.cloneNode(true);
}

function translateName(zone) {
    return zone.replace(/ /g, "_").replace(/\'/g, "_").toLowerCase();
}

function generateZoneHeader(zone) {
    let node = loadTemplate("zone-header-template");
    let div = node.querySelector(".zone-header");
    div.textContent = zone;
    div.classList.add(translateName(zone));
    return node;
}

async function loadImage(src) {
    let loader = src => new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
    return await loader(src);
}

async function mapImage(zone) {
    return await loadImage(`img/${translateName(zone)}.jpg`);
}

function getMapSize() {
    return Math.min(640, Math.floor(Math.min(window.innerHeight, window.innerWidth) - 16));
}

async function generateMap(zone, contents) {
    let path = contents["path"];

    let node = loadTemplate("map-container-template");
    let div = node.querySelector(".map-container");
    div.classList.add(translateName(zone));
    let name = node.querySelector(".map-name");
    name.textContent = zone;

    let markAName = node.querySelector(".mark-name.mark-a");
    markAName.textContent = contents["marks"][0];
    let markBName = node.querySelector(".mark-name.mark-b");
    markBName.textContent = contents["marks"][1];

    let canvas = node.querySelector(".map-canvas");
    let size = getMapSize();
    console.log(size);
    canvas.width = size;
    canvas.height = size;

    let context = canvas.getContext("2d");
    context.scale(canvas.width/41.0, canvas.height/41.0);
    context.translate(-1, -1);

    let bg = await mapImage(zone);
    context.drawImage(bg, 1, 1, 41, 41);

    context.beginPath();
    context.lineWidth = 0.4;
    path.forEach(point => {
        if (point[3] === "Aetheryte") {
            context.moveTo(point[0], point[1]);        
        } else {
            context.lineTo(point[0], point[1]);
        }
    });
    context.stroke();
    context.closePath();

    path.forEach(point => {
        if (point[3] === "Aetheryte") {
            context.beginPath();
            context.fillStyle = "cyan";
            context.ellipse(point[0], point[1], 0.5, 0.5, 0, 0, 2*Math.PI);
            context.fill();
            context.closePath();
        } else {
            if (point[4] && point[5]) {
                context.beginPath();
                context.fillStyle = "red";
                context.ellipse(point[0], point[1], 0.5, 0.5, Math.PI / 2.0, 0, 2*Math.PI);
                context.fill();
                context.closePath();
                context.beginPath();
                context.fillStyle = "orange";
                context.ellipse(point[0], point[1], 0.5, 0.5, Math.PI / 2.0, Math.PI, 2*Math.PI);
                context.fill();
                context.closePath();
            } else if (point[4] && !point[5]) {
                context.beginPath();
                context.fillStyle = "red";
                context.ellipse(point[0], point[1], 0.5, 0.5, Math.PI / 2.0, 0, 2*Math.PI);
                context.fill();
                context.closePath();
            } else if (!point[4] && point[5]) {
                context.beginPath();
                context.fillStyle = "orange";
                context.ellipse(point[0], point[1], 0.5, 0.5, Math.PI / 2.0, 0, 2*Math.PI);
                context.fill();
                context.closePath();
            }
        }
    });

    toggleMapContainer(div, false);
    return node;
}

async function populateData(data, zoneHeaderContainer, mapsContainer) {
    for (const [zone, contents] of Object.entries(data)) {
        let headerNode = generateZoneHeader(zone);
        zoneHeaderContainer.append(headerNode);
        let mapNode = await generateMap(zone, contents);
        mapsContainer.append(mapNode);
    }
}

function toggleMapContainer(container, toggle) {
    container.style.display = toggle ? "block" : "none";
}

function toggleZoneHeaderContainer(container, toggle) {
    container.classList.toggle("active", toggle);
}

function setControls(zoneHeaderContainer, mapsContainer) {
    let mapContainers = mapsContainer.querySelectorAll(".map-container");
    let zoneHeaderContainers = zoneHeaderContainer.querySelectorAll(".zone-header");
    zoneHeaderContainers.forEach(zoneHeaderContainer => {
        let zone = zoneHeaderContainer.classList[1];
        let mapContainer = mapsContainer.querySelector(`.${zone}`);
        zoneHeaderContainer.addEventListener("click", () => {
            mapContainers.forEach(container => toggleMapContainer(container, container == mapContainer));
            zoneHeaderContainers.forEach(container => toggleZoneHeaderContainer(container, container == zoneHeaderContainer));
        });
    });
}

async function run() {
    let zoneHeaderContainer = document.getElementById("zone-header-container");
    let mapsContainer = document.getElementById("maps-container");

    let data = await getData();
    await populateData(data, zoneHeaderContainer, mapsContainer);
    setControls(zoneHeaderContainer, mapsContainer);
    toggleZoneHeaderContainer(zoneHeaderContainer.querySelector(".zone-header"), true);
    toggleMapContainer(mapsContainer.querySelector(".map-container"), true);
}

window.onload = run;