require("dotenv").config();
const fs = require("fs");
const crypto = require("crypto");
const Jimp = require("jimp");

const KEY = process.env.ENCRYPTION_KEY;

if (!KEY) {
  console.error("ENCRYPTION_KEY is not set in environment variables.");
  process.exit(1);
}

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(KEY, "hex"),
    Buffer.alloc(16, 0)
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted;
}

function decrypt(buffer) {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(KEY, "hex"),
    Buffer.alloc(16, 0)
  );
  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
  return decrypted.toString();
}

function encodeFileToNoiseImage(filePath, outputImagePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) throw err;

    const encryptedData = encrypt(data.toString("base64"));
    const imageSize = Math.ceil(Math.sqrt(encryptedData.length));

    new Jimp(imageSize, imageSize, (err, image) => {
      if (err) throw err;

      for (let i = 0; i < encryptedData.length; i++) {
        const x = i % imageSize;
        const y = Math.floor(i / imageSize);
        const byte = encryptedData[i];
        image.setPixelColor(Jimp.rgbaToInt(byte, byte, byte, 255), x, y);
      }

      image.write(outputImagePath, (err) => {
        if (err) throw err;
        console.log(`Encoded image saved to ${outputImagePath}`);
      });
    });
  });
}

function decodeNoiseImageToFile(imagePath, outputFilePath) {
  Jimp.read(imagePath, (err, image) => {
    if (err) throw err;

    const encryptedData = Buffer.alloc(
      image.bitmap.width * image.bitmap.height
    );

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const byte = image.bitmap.data[idx];
      encryptedData.writeUInt8(byte, y * image.bitmap.width + x);
    });

    const decryptedData = decrypt(encryptedData);
    const buffer = Buffer.from(decryptedData, "base64");

    fs.writeFile(outputFilePath, buffer, (err) => {
      if (err) throw err;
      console.log(`Decoded file saved to ${outputFilePath}`);
    });
  });
}

const [, , command, inputPath, outputPath] = process.argv;

if (command === "encode" && inputPath && outputPath) {
  encodeFileToNoiseImage(inputPath, outputPath);
} else if (command === "decode" && inputPath && outputPath) {
  decodeNoiseImageToFile(inputPath, outputPath);
} else {
  console.log(
    "Usage: node index.js <encode|decode> <inputPath> <outputPath>\n"
  );
}
