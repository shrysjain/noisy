# Noisy 🔐

 Noisy offers a secure and novel method to encode files into noise images and decode them back to their original form, preserving file extensions during the process.

## Features

- File Encryption: Encrypts files using AES-256 encryption before encoding into a noise image.
- Noise Image Encoding: Converts encrypted files into noise images with variable intensity.
- File Decryption: Decodes noise images back into their original files while preserving file extensions.
- Metadata Handling: Stores and retrieves file extensions from image metadata to ensure accurate file recovery.
- Scalability: Capable of handling files of any size by dynamically adjusting noise image dimensions.

## Getting Started

Noisy is currently not available at a publically deployed access point. To try it out, run your own instance by cloning this repository and running `npm run dev`.

## Built With

- Node.js: Backend environment for file handling and encryption.
- Jimp: Image processing library for manipulating noise images.
- AES-256 Encryption: Secure encryption standard for file protection.
- Multer: Middleware for handling file uploads.
- Exiftool-Vendored: Library for reading and writing image metadata.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests to contribute enhancements, fix issues, or add features.

## Licensing

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
