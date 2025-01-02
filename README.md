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

# Next-armored 🛡️

> NextJs middleware toolkit to secure your next server with flexibility and ease.

- 🚀 Easy to use: simple middleware creation.
- 🔧 Flexible: Customize middleware configurations to fit your needs.
- 🛡️ Secure: Default configurations are based on best practices and security standards.
- ✅ Type-safe: Middleware is fully typed and compatible with Next and TypeScript.

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

## Usage

### CORS middleware

See [how to configure CORS middleware](./middlewares/cross-origin-resource-sharing/README.md) for more details.

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

### How to combine with other middlewares

TODO

## License

[MIT](LICENSE).
