import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [encodedPath, setEncodedPath] = useState("");
  const [decodedPath, setDecodedPath] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEncode = async () => {
    try {
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/encode", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEncodedPath(response.data.path);
    } catch (error) {
      setError("Failed to encode the file");
    }
  };

  const handleDecode = async () => {
    try {
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/decode", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDecodedPath(response.data.path);
    } catch (error) {
      setError("Failed to decode the file");
    }
  };

  return (
    <div>
      <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Noisy</h1>
        <p className="text-sm text-slate-600 mb-6">
          Securely encode files into images, preserving extensions, and compress
          any size file into seemingly meaningless noise
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
        />
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleEncode}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Encode
          </button>
          <button
            onClick={handleDecode}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Decode
          </button>
        </div>
        {encodedPath && (
          <p className="mb-2">
            <span className="font-semibold">Encoded Image:</span>{" "}
            <a
              href={encodedPath}
              download
              className="text-blue-600 hover:text-blue-800 underline"
            >
              CLICK TO DOWNLOAD
            </a>
          </p>
        )}
        {decodedPath && (
          <p>
            <span className="font-semibold">Decoded File:</span>{" "}
            <a
              href={decodedPath}
              download
              className="text-blue-600 hover:text-blue-800 underline"
            >
              CLICK TO DOWNLOAD
            </a>
          </p>
        )}
      </div>
      <footer className="bg-gray-100 py-4 px-6 text-center text-sm text-gray-600">
        developed with ❤️ by{" "}
        <a
          href="https://shrysjain.me"
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
        >
          shreyas jain
        </a>{" "}
        &bull; all rights reserved
      </footer>
    </div>
  );
}
