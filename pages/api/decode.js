import fs from "fs";
import path from "path";
import crypto from "crypto";
import Jimp from "jimp";
import multer from "multer";
import { exiftool } from "exiftool-vendored";

const KEY = process.env.ENCRYPTION_KEY;

function decrypt(buffer) {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(KEY, "hex"),
    Buffer.alloc(16, 0)
  );
  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
  return decrypted.toString();
}

const upload = multer({ dest: "public/uploads/" });

export const config = {
  api: {
    bodyParser: false,
  },
};

const decodeHandler = async (req, res) => {
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

    const imagePath = path.resolve(file.path);

    const metadata = await exiftool.read(imagePath);
    const fileExtension = metadata.Comment || "";

    const outputFilePath = path.resolve(
      ".",
      "public",
      "decoded",
      `${file.filename}${fileExtension}`
    );

    Jimp.read(imagePath, (err, image) => {
      if (err) return res.status(500).json({ error: "Jimp error" });

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
        if (err) return res.status(500).json({ error: "File write error" });
        return res.status(200).json({
          message: "Decoded file saved",
          path: `/decoded/${file.filename}${fileExtension}`,
        });
      });
    });
  });
};

export default decodeHandler;
