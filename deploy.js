const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');

// Set your AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Set your S3 bucket name and the local path of your website files
const bucketName = 'mangalyaan';
const localPath = 'C:\\Users\\Dell\\OneDrive\\Desktop\\DO\\AWS'; // Double backslashes in the path

// Create an S3 object
const s3 = new AWS.S3();

const uploadFiles = async () => {
    try {
      // Use recursive-readdir to get all files, including those in nested folders
      const files = await recursive(localPath);
  
      for (const file of files) {

        if (file.includes('node_modules')) {
            console.log(`Skipped: ${file} (inside node_modules)`);
            continue;
        }
  
        const fileContent = fs.readFileSync(file);
        // Calculate the relative path within the local folder
        const relativePath = path.relative(localPath, file);
  
        await s3.upload({
          Bucket: bucketName,
          Key: relativePath.replace(/\\/g, '/'),
          Body: fileContent,
          ContentType: 'text/html' // Set the appropriate content type
        }).promise();
  
        console.log(`Uploaded: ${relativePath}`);
      }
  
      console.log('Upload completed successfully.');
  
      // Configure the S3 bucket for static website hosting
      await s3.putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: {
            Suffix: 'index.html'
          }
        }
      }).promise();
  
      console.log('Website hosting configured successfully.');
    } catch (error) {
      console.error('Error:', error);
    }
  };

// Call the function to upload files
uploadFiles();
