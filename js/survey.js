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
            const ctx = createCanvas(this.width, this.height);
            ctx.drawImage(image, 0, 0);
            const imgData = ctx.getImageData(0, 0, this.width, this.height);
            resolve(imgData);
        }
    });
}

$.getJSON('/api/getNameOfImages', function (data) {
    console.log(data);
    data.forEach(element => {
        const path = "scans/" + element.name;
        loadImage(path);
    });
});
