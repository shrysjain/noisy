import fs from "fs";
import path from "path";
import crypto from "crypto";
import Jimp from "jimp";
import multer from "multer";
import { exiftool } from "exiftool-vendored";

const KEY = process.env.ENCRYPTION_KEY;

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(KEY, "hex"),
    Buffer.alloc(16, 0)
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted;
}

const upload = multer({ dest: "public/uploads/" });

export const config = {
  api: {
    bodyParser: false,
  },
};

const encodeHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "File upload error" });
    }

    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const filePath = path.resolve(file.path);
    const outputImagePath = path.resolve(
      ".",
      "public",
      "encoded",
      `${file.filename}.png`
    );
    const fileExtension = path.extname(file.originalname);

    fs.readFile(filePath, (err, data) => {
      if (err) return res.status(500).json({ error: "File read error" });

      const encryptedData = encrypt(data.toString("base64"));
      const imageSize = Math.ceil(Math.sqrt(encryptedData.length));

      new Jimp(imageSize, imageSize, (err, image) => {
        if (err) return res.status(500).json({ error: "Jimp error" });

        for (let i = 0; i < encryptedData.length; i++) {
          const x = i % imageSize;
          const y = Math.floor(i / imageSize);
          const byte = encryptedData[i];
          image.setPixelColor(Jimp.rgbaToInt(byte, byte, byte, 255), x, y);
        }

        image.write(outputImagePath, async (err) => {
          if (err) return res.status(500).json({ error: "Image write error" });

          await exiftool.write(outputImagePath, {
            Comment: fileExtension,
          });

          return res.status(200).json({
            message: "Encoded image saved",
            path: `/encoded/${file.filename}.png`,
          });
        });
      });
    });
  });
};

export default encodeHandler;
