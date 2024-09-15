const http = require('http');
const https = require('https');
const url = require('url');

function getTitle(address, callback) {
  const request = address.startsWith('https') ? https : http;

  request.get(address, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log(data);
      const match = data.match(/<title>([^<]*)<\/title>/);
      const match2 = data.match(/<TITLE>([^<]*)<\/TITLE>/);

      if (match || match2) {
        callback(null, match ? match[1] : match2[1]);
      } else {
        callback(null, 'NO RESPONSE');
      }
    });
  }).on('error', (err) => {
    callback(null, 'NO RESPONSE');
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/I/want/title')) {
    const query = url.parse(req.url, true).query;
    const addresses = query.address instanceof Array ? query.address : [query.address];
    
    if (!addresses) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>No addresses provided</h1>');
      return;
    }

    let results = [];
    let count = 0;

    addresses.forEach((address) => {
      getTitle(address, (err, title) => {
        results.push(`<li>${address} - "${title}"</li>`);
        count++;
        if (count === addresses.length) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head></head>
              <body>
                <h1>Following are the titles of given websites:</h1>
                <ul>
                  ${results.join('')}
                </ul>
              </body>
            </html>
          `);
        }
      });
    });``

  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
