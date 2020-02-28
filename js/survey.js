class Coordinate {
    constructor(x, y, number, value) {
        this.x = x;
        this.y = y;
        this.number = number;
        this.value = value;
    }
}

let globalCtx;
let coordinates = [];

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    return canvas.getContext('2d');
}

function loadImage(path) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = path;
        image.onload = function () {
            globalCtx = createCanvas(this.width, this.height);
            globalCtx.drawImage(image, 0, 0);
            const imgData = globalCtx.getImageData(0, 0, this.width, this.height);
            resolve(imgData);
        }
    });
}

function loadTemplate(path) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = path;
        image.onload = function () {
            let ctx = createCanvas(this.width, this.height);
            ctx.drawImage(image, 0, 0);
            const imgData = ctx.getImageData(0, 0, this.width, this.height);
            resolve(imgData);
        }
    });
}

function templateMatching(source, template) {
    let best = iterate(source, template);
    globalCtx.strokeStyle = 'red';
    globalCtx.strokeRect(best.x, best.y, template.width, template.height);
    return best;
}

function templateMatching2(source, template,addx, addy) {
    let bests = iterate2(source, template);
    globalCtx.strokeStyle = 'green';
    globalCtx.fillRect(bests[0].x+addx, bests[0].y+addy, template.width, template.height);
    globalCtx.fillRect(bests[1].x+addx, bests[1].y+addy, template.width, template.height);
    //return best;
}

function calculateSqDiffGray(source, xOffset, yOffset, template, best) {
    let sum = 0;
    for (let y = 0; y < template.height; y++) {
        for (let x = 0; x < template.width; x++) {
            let m = (y * template.width + x);
            let j = m * 4;
            let i = ((y + yOffset) * source.width + (x + xOffset)) * 4;
            sum += Math.pow((template.data[j] - source.data[i]+template.data[j+1] - source.data[i+1]+template.data[j+2] - source.data[i+2]), 2);
            if (sum > best.value || sum > 100000000) {
                return 999999999;
            }
        }
    }
    return sum;
};

function iterate2(source, template) {
    let bests = [];
    let best = { x: null, y: null, value: 99999999999 };
    let best2 = { x: null, y: null, value: 99999999999 };
    for (let y = 0; y < source.height - template.height + 1; ++y) {
        for (let x = 0; x < source.width - template.width + 1; ++x) {
            let value = calculateSqDiffGray(source, x, y, template, best);

            if (value < best.value) {
                best2 = Object.assign({}, best);
                best = { x: x, y: y, value: value }
            }
        }
    }
    bests.push(best);
    bests.push(best2);
    return bests;
}

function iterate(source, template) {
    let best = { x: null, y: null, value: 99999999999 };
    for (let y = 0; y < source.height - template.height + 1; ++y) {
        for (let x = 0; x < source.width / 2 - template.width + 1; ++x) {
            let value = calculateSqDiffGray(source, x, y, template, best);

            if (value < best.value) {
                best = { x: x, y: y, value: value }
            }
        }
    }
    return best;
}

function getNameOfTemplates() {
    return new Promise((resolve, reject) => {
        $.getJSON('/api/getNameOfTemplates', function (data) {
            resolve(data);
        });
    });
}


function initSystem() {
    return new Promise((resolve, reject) => {
        getNameOfTemplates().then(function (nameOfTemplates) {
            $.getJSON('/api/getNameOfImages', function (data) {
                data.forEach(element => {
                    const pathToImages = "scans/" + element.name;
                    loadImage(pathToImages).then(function (source) {
                        nameOfTemplates.forEach(nameOfTemplate => {
                            const pathToTemplate = "templates/" + nameOfTemplate.name;
                            loadTemplate(pathToTemplate).then(function (template) {
                                let result = templateMatching(source, template);
                                coordinates.push(new Coordinate(result.x, result.y, parseInt(nameOfTemplate.name), ''));
                            });
                        })
                        resolve(coordinates);
                    });
                });
            });
        });
    });
}
function imgTester(template){
	const canvas = document.createElement('canvas');
	canvas.width  = template.width;
	canvas.height = template.height;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');
	const imgData=ctx.createImageData(template.width,template.height);

	for (let i=0;i<imgData.data.length;i+=4){
			  imgData.data[i+0] = template.data[i];
			  imgData.data[i+1]= template.data[i+1];
			  imgData.data[i+2]= template.data[i+2];
			  imgData.data[i+3]= template.data[i+3];
	}

	ctx.putImageData(imgData,0,0);
	return ctx;
}


initSystem().then(function (coordinates) {
    const pathToTemplate = "checkTemplate/" + "checkTemplate.png";
    loadTemplate(pathToTemplate).then(function(template) {
        for(let i = 0; i < coordinates.length-1; i++){
            let image = globalCtx.getImageData(coordinates[i].x, coordinates[i].y, 
                coordinates[i+1].x-coordinates[i].x+100 , coordinates[i+1].y-coordinates[i].y);
            templateMatching2(image, template, coordinates[i].x, coordinates[i].y );
            console.log(i);
        }
    });
    
});