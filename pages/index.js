import React, { useState } from "react";
import Jimp from "jimp";
import CryptoJS from "crypto-js";
import Image from "next/image";

const Home = () => {
  const [file, setFile] = useState(null);
  const [encodedFile, setEncodedFile] = useState(null);
  const [decodedFile, setDecodedFile] = useState(null);
  const [customKey, setCustomKey] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleKeyChange = (e) => {
    setCustomKey(e.target.value);
  };

  const getKey = () => {
    return customKey || process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  };

  const encrypt = (data) => {
    return CryptoJS.AES.encrypt(data, getKey()).toString();
  };

  const decrypt = (data) => {
    const bytes = CryptoJS.AES.decrypt(data, getKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleEncode = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      const encryptedData = encrypt(data);

      const imageSize = Math.ceil(Math.sqrt(encryptedData.length));
      const image = await new Jimp(imageSize, imageSize);

      for (let i = 0; i < encryptedData.length; i++) {
        const x = i % imageSize;
        const y = Math.floor(i / imageSize);
        const charCode = encryptedData.charCodeAt(i);
        image.setPixelColor(
          Jimp.rgbaToInt(charCode, charCode, charCode, 255),
          x,
          y
        );
      }

      image.getBase64(Jimp.MIME_PNG, (err, src) => {
        setEncodedFile(src);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDecode = async () => {
    const image = await Jimp.read(decodedFile);
    let encryptedData = "";

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const red = image.bitmap.data[idx];
      encryptedData += String.fromCharCode(red);
    });

    const decryptedData = decrypt(encryptedData);
    const blob = new Blob([decryptedData], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decoded_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>
        <b>noisy</b>
      </h1>

      <div>
        <h2>Encoding</h2>
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Custom Encryption Key"
          onChange={handleKeyChange}
        />
        <button onClick={handleEncode}>Encode File</button>
        {encodedFile && (
          <div>
            <h3>Encoded Image</h3>
            <Image src={encodedFile} alt="Encoded" />
          </div>
        )}
      </div>

      <div>
        <h2>Decoding</h2>
        <input
          type="file"
          onChange={(e) =>
            setDecodedFile(URL.createObjectURL(e.target.files[0]))
          }
        />
        <input
          type="text"
          placeholder="Custom Encryption Key"
          onChange={handleKeyChange}
        />
        <button onClick={handleDecode}>Decode File</button>
      </div>
    </div>
  );
};

export default Home;
