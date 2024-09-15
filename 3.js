const http = require('http');
const https = require('https');
const url = require('url');

function getTitle(address) {
  return new Promise((resolve) => {
    const request = address.startsWith('https') ? https : http;

    request.get(address, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const match = data.match(/<title>([^<]*)<\/title>/);
        if (match) {
          resolve({ address, title: match[1] });
        } else {
          resolve({ address, title: 'NO RESPONSE' });
        }
      });
    }).on('error', (err) => {
      resolve({ address, title: 'NO RESPONSE' });
    });
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

    Promise.all(addresses.map(getTitle)).then((results) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head></head>
          <body>
            <h1>Following are the titles of given websites:</h1>
            <ul>
              ${results.map(result => `<li>${result.address} - "${result.title}"</li>`).join('')}
            </ul>
          </body>
        </html>
      `);
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
