const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

class AzureStorageService {
  constructor(connectionString, containerName) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.blobServiceClient = connectionString ? 
      BlobServiceClient.fromConnectionString(connectionString) : 
      null;
  }

  async uploadFile(filePath, blobName) {
    // Input validation
    if (!filePath) return { error: true, message: 'Invalid file path' };
    if (!blobName) return { error: true, message: 'Invalid blob name' };
    if (!this.blobServiceClient) return { error: true, message: 'Storage client not initialized' };

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

    try {
      // Check if the container exists, and create it if it doesn't
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        await containerClient.create();
        
      }

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Check if the blob already exists
      const blobExists = await blockBlobClient.exists();
      if (blobExists) return { error: true, message: 'File already exists.' };

      // Proceed with uploading the file if it doesn't exist
      const uploadStream = fs.createReadStream(filePath);
      const uploadBlobResponse = await blockBlobClient.uploadStream(uploadStream);
      return { error: false, response: uploadBlobResponse };
    } catch (error) {
      // Specific error handling based on status codes
      if (error.statusCode === 403) {
        return { error: true, message: 'Unauthorized access to the storage account.' };
      } else if (error.statusCode === 404) {
        return { error: true, message: 'Container or blob not found.' };
      } else if (error.code === 'ENOTFOUND') {
        return { error: true, message: 'Network connectivity issue.' };
      }
      return { error: true, message: `Error uploading file: ${error.message}` };
    }
  }

  async downloadFile(filePath, blobName) {
    // Input validation
    if (!filePath) return { error: true, message: 'Invalid file path' };
    if (!blobName) return { error: true, message: 'Invalid blob name' };
    if (!this.blobServiceClient) return { error: true, message: 'Storage client not initialized' };

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      // Check if the blob exists
      const blobExists = await blockBlobClient.exists();
      if (!blobExists) return { error: true, message: 'File does not exist.' };

      // Proceed with downloading the file if it exists
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      return {
        error: false,
        response: downloadBlockBlobResponse.readableStreamBody,
        contentType: downloadBlockBlobResponse.contentType
      };
    } catch (error) {
      // Specific error handling based on status codes
      if (error.statusCode === 403) {
        return { error: true, message: 'Unauthorized access to the storage account.' };
      } else if (error.statusCode === 404) {
        return { error: true, message: 'Blob not found.' };
      } else if (error.code === 'ENOTFOUND') {
        return { error: true, message: 'Network connectivity issue.' };
      }
      return { error: true, message: `Error downloading file: ${error.message}` };
    }
  }
}

// Create and export a singleton instance with environment variables
const azureStorageService = new AzureStorageService(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
  'isafarikycdoc'
);

module.exports = azureStorageService;
// Also export the class for testing
module.exports.AzureStorageService = AzureStorageService;
