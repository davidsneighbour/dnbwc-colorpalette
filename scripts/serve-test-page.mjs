import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import {
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const distFile = join(projectRoot, 'dist', 'dnb-colorpalette.js');
const host = process.env.HOST || '127.0.0.1';
const port = Number.parseInt(process.env.PORT || '4173', 10);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

if (!existsSync(distFile)) {
  console.error(
    'Missing dist/dnb-colorpalette.js. Run `npm run build` before starting the test page server.',
  );
  process.exit(1);
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const pathname = url.pathname === '/'
    ? '/test.html'
    : decodeURIComponent(url.pathname);
  const requestedPath = normalize(pathname).replace(/^[/\\]+/, '');
  const filePath = resolve(projectRoot, requestedPath);
  const relativePath = relative(projectRoot, filePath);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'cache-control': 'no-store',
    ...headers,
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, 'Method Not Allowed', { allow: 'GET, HEAD' });
    return;
  }

  const filePath = resolveRequestPath(request.url);

  if (!filePath) {
    send(response, 403, 'Forbidden');
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      send(response, 404, 'Not Found');
      return;
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-length': fileStats.size,
      'content-type': contentTypes.get(extname(filePath))
        || 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT') {
      send(response, 404, 'Not Found');
      return;
    }

    console.error(error);
    send(response, 500, 'Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Serving the dist test page at http://${host}:${port}/`);
  console.log('Press Ctrl+C to stop the server.');
});
