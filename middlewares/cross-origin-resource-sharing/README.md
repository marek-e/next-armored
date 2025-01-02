<p align="center">
  <a 
  href="https://raw.githubusercontent.com/marek-e/next-armored/master/assets/n-armor.svg" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://raw.githubusercontent.com/marek-e/next-armored/master/assets/n-armor.svg" alt="next-armored logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/next-armored"><img src="https://img.shields.io/npm/v/next-armored.svg" alt="npm package"></a>
  <a href="https://github.com/marek-e/next-armored/actions/workflows/ci.yml"><img src="https://github.com/marek-e/next-armored/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status"></a>
  <a href="https://pr.new/marek-e/next-armored"><img src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a>
</p>
<br/>

# How to configure CORS middleware for Next.js

### 🛡️ next-armored/cors

> Cross-Origin Resource Sharing (CORS) middleware for Next.js

## Installation

### Package Manager

Using npm:

```bash
npm i next-armored
```

Using yarn:

```bash
yarn add next-armored
```

Using pnpm:

```bash
pnpm add next-armored
```

Using bun:

```bash
bun add next-armored
```

### Usage

Go to your [middleware.ts file](./src/middleware.ts) and add the following code:

```typescript middleware.ts
import { NextRequest } from 'next/server';
import { createCorsMiddleware } from 'next-armored/cors';

const corsMiddleware = createCorsMiddleware({
  origins: ['https://example.com', 'http://localhost:5173'],
});

export function middleware(request: NextRequest) {
  return corsMiddleware(request);
}

export const config = {
  matcher: ['/api/:path*'],
};
```

Import the `createCorsMiddleware` function from `next-armored/cors` and pass the configuration object to it.
You have to at least specify the `origins` option because keeping `*` by default is not recommended as it can be a security risk.
Then add the cors middleware to the `middleware` function and return the result.
Last step is to export the `config` object which is used to match the middleware to your api routes.

```typescript
const corsMiddleware = createCorsMiddleware({
  origins: ['https://example.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  headers: ['Content-Type'],
  maxAge: 60 * 60 * 24,
  optionsSuccessStatus: 204,
  allowCredentials: true,
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
});
```

You can define other options as well.

- `origins` - array of origins that are allowed to access the resource. Is required.
- `methods` - array of methods that are allowed to access the resource. Defaults to `["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]`.
- `headers` - array of headers that are allowed to access the resource. Defaults to `["Content-Type", "Authorization"]`.
- `maxAge` - number of seconds that the results of a preflight request can be cached. Defaults to `60 * 60 * 24` (1 day).
- `optionsSuccessStatus` - status code to send for successful OPTIONS requests. Defaults to `204`.
- `allowCredentials` - boolean value to indicate if credentials are allowed. Defaults to `true`.
- `exposedHeaders` - array of headers that are exposed to the client. Defaults to `[]`.
- `preflightContinue` - boolean value to indicate if the next middleware should be executed for preflight requests. Defaults to `false`.

### How to combine with other middlewares

TODO

## License

[MIT](LICENSE).
