console.log('+--------------------------------------+');
console.log('|    CREATOR BY : BAGUS WIRAYUDA       |');
console.log('|  SPECIAL THANKS : MUH IDUL CHANDRA   |');
console.log('|TELEGRAM : https://t.me/baguswry101101|');
console.log('+--------------------------------------+');

const fs = require('fs');
const bwipjs = require('bwip-js');
const sharp = require('sharp');

const templateFilePath = 'template.png';
const templateImage = sharp(templateFilePath);
const barcodePosition = {
    start: {
        x: null,
        y: 1692
    },
};
const folderName = 'barcodes';
fs.mkdirSync(folderName, { recursive: true });

function calculateCenterX(templateWidth, barcodeWidth) {
    return Math.floor((templateWidth - barcodeWidth) / 2);
}

sharp(templateFilePath).metadata()
    .then(metadata => {
        const templateWidth = metadata.width;

        fs.readFile('data.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            const texts = data.split('\n');
            texts.forEach((barcodeText, index) => {
                const config = {
                    bcid: 'code128',
                    text: barcodeText.trim(),
                    scale: 9,
                    height: 25,
                    includetext: true,
                    textxalign: 'center',
                    backgroundcolor: 'FFFFFF',
                    paddingwidth: 10,
                    paddingheight: 5,
                };
                bwipjs.toBuffer(config, (err, png) => {
                    if (err) {
                        // console.error(`Error creating barcode for text ${barcodeText}:`, err);
                    } else {
                        const barcodeFileName = `${folderName}/${barcodeText.trim()}.png`;
                        fs.writeFile(barcodeFileName, png, 'binary', (err) => {
                            if (err) {
                                // console.error(`Error saving barcode image ${barcodeFileName}:`, err);
                            } else {
                                // console.log(`Barcode image saved as ${barcodeFileName}`);
                                sharp(barcodeFileName).metadata()
                                    .then(metadata => {
                                        const centerX = calculateCenterX(templateWidth, metadata.width);
                                        barcodePosition.start.x = centerX;
                                        templateImage.composite([{
                                            input: barcodeFileName,
                                            top: barcodePosition.start.y,
                                            left: barcodePosition.start.x
                                        }]).toFile(`${folderName}/result_${barcodeText.trim()}.png`, (err, info) => {
                                            if (err) {
                                                // console.error(`Error composing barcode onto template for text ${barcodeText}:`, err);
                                            } else {
                                                console.log(`Sukses mengubah barcode => ${barcodeText.trim()}.png`);
                                                // Delete the barcode file after composite is saved
                                                fs.unlink(barcodeFileName, err => {
                                                    if (err) {
                                                        // console.error(`Error deleting barcode file ${barcodeFileName}:`, err);
                                                    } else {
                                                        // console.log(`Deleted barcode file ${barcodeFileName}`);
                                                    }
                                                });
                                            }
                                        });
                                    })
                                    .catch(err => {
                                        console.error(`Error getting metadata for barcode image ${barcodeFileName}:`, err);
                                    });
                            }
                        });
                    }
                });
            });
        });
    })
    .catch(err => {
        console.error('Error getting metadata for template image:', err);
    });
