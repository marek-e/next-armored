import { NextResponse, NextFetchEvent, NextRequest } from 'next/server';
import type { CorsConfig, Method, Origin } from './config';
import { DEFAULT_CORS_CONFIG } from './config';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';

// CORS headers
const ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
const ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';
const ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods';
const ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers';
const ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
const ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age';

type NextCorsMiddleware = (
  request: NextRequest,
  response?: NextResponse,
) => NextMiddlewareResult;

interface Header {
  key: string;
  value: string;
}

const createCorsMiddleware = (config: CorsConfig): NextCorsMiddleware => {
  const configWithDefaults = { ...DEFAULT_CORS_CONFIG, ...config };
  const {
    origins,
    methods,
    headers,
    allowCredentials,
    exposedHeaders,
    maxAge,
    optionsSuccessStatus,
    preflightContinue,
  } = configWithDefaults;

  function configureMaxAge(maxAge: number): Header {
    return {
      key: ACCESS_CONTROL_MAX_AGE,
      value: maxAge.toString(),
    };
  }

  function configureExposedHeaders(exposedHeaders: string[]): Header {
    return {
      key: ACCESS_CONTROL_EXPOSE_HEADERS,
      value: exposedHeaders.join(', '),
    };
  }

  function configureAllowCredentials(allowCredentials: boolean): Header {
    return {
      key: ACCESS_CONTROL_ALLOW_CREDENTIALS,
      value: allowCredentials ? 'true' : 'false',
    };
  }

  function configureAllowMethods(methods: Method[]): Header {
    return {
      key: ACCESS_CONTROL_ALLOW_METHODS,
      value: methods.join(', '),
    };
  }

  function configureAllowHeaders(headers: string[]): Header {
    return {
      key: ACCESS_CONTROL_ALLOW_HEADERS,
      value: headers.join(', '),
    };
  }

  function configureAllowOrigin(origin: string): Header {
    return {
      key: ACCESS_CONTROL_ALLOW_ORIGIN,
      value: origin,
    };
  }

  type IsOriginAllowedResult =
    | {
        result: false;
      }
    | {
        result: true;
        origin: string;
      };

  function getIsOriginAllowed(
    origin: string,
    allowedOrigins: Origin[],
  ): IsOriginAllowedResult {
    if (allowedOrigins.length === 0) {
      return { result: false };
    }
    // if contains '*', allow all origins
    if (allowedOrigins.includes('*')) {
      return { result: true, origin };
    }
    for (const allowedOrigin of allowedOrigins) {
      if (typeof allowedOrigin === 'string' && allowedOrigin === origin) {
        return { result: true, origin };
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return { result: true, origin };
      }
    }

    return { result: false };
  }

  /**
   * @description Middleware handling CORS
   * @param request - The request object with information about the origin and the method
   * @param response (optional) - If provided, the headers will be attached to the response. Unless in case of preflight request without preflightContinue set to true.
   * @returns A NextResponse object with the headers attached
   */
  const middleware = (request: NextRequest, response?: NextResponse) => {
    const origin = request.headers.get('origin') ?? '';
    const isOriginAllowed = getIsOriginAllowed(origin, origins);
    const optionsHeaders: Header[] = [];
    optionsHeaders.push(configureMaxAge(maxAge));
    optionsHeaders.push(configureExposedHeaders(exposedHeaders));
    optionsHeaders.push(configureAllowCredentials(allowCredentials));
    optionsHeaders.push(configureAllowMethods(methods));
    optionsHeaders.push(configureAllowHeaders(headers));

    if (isOriginAllowed.result) {
      optionsHeaders.push(configureAllowOrigin(isOriginAllowed.origin));
    }

    const isPreflight = request.method === 'OPTIONS';

    if (isPreflight && !preflightContinue) {
      return NextResponse.json(
        {},
        {
          headers: optionsHeaders.map(header => [header.key, header.value]),
          status: optionsSuccessStatus,
        },
      );
    }

    const nextResponse = response ?? NextResponse.next();

    optionsHeaders.forEach(({ key, value }) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  };

  return middleware;
};

export default createCorsMiddleware;
