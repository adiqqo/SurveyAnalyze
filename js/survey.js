let globalCtx;

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
    globalCtx.strokeStyle = 'green';
    globalCtx.strokeRect(best.x, best.y, template.width, template.height);
}

function calculateSqDiffGray(source, xOffset, yOffset, template, best) {
    let sum = 0;
    for (let y = 0; y < template.height; y++) {
        for (let x = 0; x < template.width; x++) {
            let m = (y * template.width + x);
            let j = m * 4;
            let i = ((y + yOffset) * source.width + (x + xOffset)) * 4;
            sum += Math.pow((template.data[j] - source.data[i]), 2);
            if (sum > best.value || sum > 100000000) {
                return 999999999;
            }
        }
    }
    return sum;
};

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
    console.log(best)
    return best;
}

function getNameOfTemplates() {
    return new Promise((resolve, reject) => {
        $.getJSON('/api/getNameOfTemplates', function (data) {
            resolve(data);
        });
    });
}

getNameOfTemplates().then(function (nameOfTemplates) {
    $.getJSON('/api/getNameOfImages', function (data) {
        console.log(data);
        data.forEach(element => {
            const pathToImages = "scans/" + element.name;
            loadImage(pathToImages).then(function (source) {
                nameOfTemplates.forEach(nameOfTemplate => {
                    const pathToTemplate = "templates/" + nameOfTemplate.name;
                    loadTemplate(pathToTemplate).then(function (template) {
                        templateMatching(source, template);
                    });
                })
            });
        });
    });
});