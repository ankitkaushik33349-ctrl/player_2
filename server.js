const express = require('express');
const axios = require('axios');
const app = express();

const TARGET_HOST = 'https://vidfast.pro';

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

        res.set(response.headers);
        const contentType = response.headers['content-type'];

        if (contentType && contentType.includes('text/html')) {
            let htmlContent = '';
            response.data.on('data', chunk => {
                htmlContent += chunk.toString();
            });
            response.data.on('end', () => {
                // Step 2: Remove the main obfuscated ad loader script.
                // We match it by the unique variable 'K'.
                htmlContent = htmlContent.replace(/<script data-cfasync="false"[^>]*>[\s\S]*?var K = 'ChmaorrCfozd[\s\S]*?<\/script>/gi, '');

                // Step 3: Remove the other known ad scripts by their domain.
                htmlContent = htmlContent.replace(/<script[^>]*src="\/\/[^"]*cagygauges\.com[^"]*"><\/script>/gi, '');
                htmlContent = htmlContent.replace(/<script[^>]*src="\/\/[^"]*intellipopup\.com[^"]*">[\s\S]*?<\/script>/gi, '');

                // Step 4: Remove all preconnect links to the ad domains.
                htmlContent = htmlContent.replace(/<link rel="(preconnect|dns-prefetch)" href="\/\/[^"]*(oundhertobeconsist\.org|yweakelandord\.com|ghabovethec\.info|adsco\.re|intellipopup\.com|track\.vcommission\.com|cagygauges\.com)[^>]*>/gi, '');

                // Step 5: Remove any hidden iframes pointing to ad domains.
                htmlContent = htmlContent.replace(/<iframe[^>]*src="\/\/[^"]*(chinaprecentalsindu\.com|brightadnetwork\.com)[^"]*"><\/iframe>/gi, '');
                
                res.send(htmlContent);
            });
        } else {
            // For all other file types (CSS, JS, etc.), pass them through directly.
            response.data.pipe(res);
        }
    } catch (error) {
        const statusCode = error.response ? error.response.status : 500;
        const statusText = error.response ? error.response.statusText : 'Internal Server Error';
        console.error(`Error fetching from target: ${statusCode} for ${req.originalUrl}`);
        res.status(statusCode).send(statusText);
    }
});

module.exports = app;