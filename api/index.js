const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Make sure you have run 'npm install cors'
const app = express();

const TARGET_HOST = 'https://vidfast.pro';

// This enables CORS for all requests, which will fix the error.
app.use(cors()); 

app.use(async (req, res) => {
    const targetUrl = `${TARGET_HOST}${req.originalUrl}`;
    try {
        const response = await axios.get(targetUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'Referer': TARGET_HOST + '/'
            }
        });

        // Pass back the original headers from the target server
        res.set(response.headers);
        
        const contentType = response.headers['content-type'];

        if (contentType && contentType.includes('text/html')) {
            let htmlContent = '';
            response.data.on('data', chunk => {
                htmlContent += chunk.toString();
            });
            response.data.on('end', () => {
                // Your ad-blocking logic
                htmlContent = htmlContent.replace(/<script data-cfasync="false"[^>]*>[\s\S]*?var K = 'ChmaorrCfozd[\s\S]*?<\/script>/gi, '');
                htmlContent = htmlContent.replace(/<script[^>]*src="\/\/[^"]*cagygauges\.com[^"]*"><\/script>/gi, '');
                htmlContent = htmlContent.replace(/<script[^>]*src="\/\/[^"]*intellipopup\.com[^"]*">[\s\S]*?<\/script>/gi, '');
                htmlContent = htmlContent.replace(/<link rel="(preconnect|dns-prefetch)"[^>]*>/gi, '');
                htmlContent = htmlContent.replace(/<iframe[^>]*src="\/\/[^"]*(chinaprecentalsindu\.com|brightadnetwork\.com)[^"]*"><\/iframe>/gi, '');
                
                res.send(htmlContent);
            });
        } else {
            // For all other files (CSS, JS, m3u8), pass them through directly.
            response.data.pipe(res);
        }
    } catch (error) {
        const statusCode = error.response ? error.response.status : 500;
        res.status(statusCode).send('Error proxying the request.');
    }
});

// DO NOT use app.listen(). Vercel handles this.
// We export the app for Vercel's serverless environment.
module.exports = app;