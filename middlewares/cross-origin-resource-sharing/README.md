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

If you are building a public api, you can allow all origins by passing `origins: ['*']` to the `createCorsMiddleware` function.
⚠️ But be aware that this can be a security risk.

### How to combine with other middlewares

```typescript middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createCorsMiddleware } from 'next-armored/cors';

const corsMiddleware = createCorsMiddleware({
  origins: ['https://example.com', 'http://localhost:5173'],
});

const otherMiddleware = (request: NextRequest) => {
  console.log('otherMiddleware');
  return NextResponse.next();
};

export function middleware(request: NextRequest) {
  const response = otherMiddleware(request);
  const isApi = request.nextUrl.pathname.startsWith('/api');
  if (isApi) {
    return corsMiddleware(request, response);
  }
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/home/:path*'],
};
```

The first option is to call the first middleware and get the response.
Then you can give the response to the cors middleware as an argument.
In this case, the cors middleware will attach the headers to the response instead of returning a new response.
If all of your middlewares doesn't apply to the same matching path, you have to check if the request is an api request and then apply the cors middleware only in that case.

The second option is to write a utils to chain the middlewares. Here is a snippet of how you can do it but it can be adapted to your needs.

```typescript chainMiddlewares.ts
export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  response: NextResponse,
) => NextMiddlewareResult;

type MiddlewareFactory = (next: CustomMiddleware) => CustomMiddleware;

export const chainMiddlewares = (
  functions: MiddlewareFactory[],
  index = 0,
): CustomMiddleware => {
  const current = functions[index];

  if (current) {
    const next = chainMiddlewares(functions, index + 1);

    return current(next);
  }

  return (
    _request: NextRequest,
    _event: NextFetchEvent,
    response: NextResponse,
  ) => response;
};
```

```typescript middlewares.ts
export const middleware = chainMiddleware([
  middleware1,
  middleware2,
  corsMiddleware,
]);
```

Otherwise, you can use other open source libraries like [next-middleware-chain](https://github.com/HamedBahram/next-middleware-chain) or [next-compose-middleware](https://github.com/kj455/next-compose-middleware) to chain the middlewares.

### How to enable/disable CORS for specific paths

You can enable CORS for specific paths by passing the `pathOptions` parameter to the `createCorsMiddleware` function.

```typescript
const corsMiddleware = createCorsMiddleware(
  { origins: ['https://example.com', 'http://localhost:5173'] },
  {
    includes: [{ startsWith: '/api/v2', additionalIncludes: ['example'] }],
  },
);
```

This will enable CORS for all paths that start with `/api/v2` and at the same time include `example` in the pathname.
`api/v2/product/example` will have CORS enabled, but `api/v1/product/example/test` will not.

On contrary, if you want to by default enable CORS for all routes and only disable it for specific paths. You can by passing the `pathOptions` with excludes parameter to the `createCorsMiddleware` function.

```typescript
const corsMiddleware = createCorsMiddleware(
  { origins: ['https://example.com', 'http://localhost:5173'] },
  {
    excludes: [{ startsWith: '/api/restricted' }],
  },
);
```

In this case, all the routes starting with `/api/restricted` will not enforce CORS but the SOP (Same-Origin Policy) as the default behavior suggests.

## License

[MIT](LICENSE).
