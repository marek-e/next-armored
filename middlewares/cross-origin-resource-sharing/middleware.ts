import { NextResponse, NextRequest } from 'next/server';
import type {
  CorsConfig,
  IsOriginAllowedResult,
  Method,
  Origin,
} from './types';
import { DEFAULT_CORS_CONFIG } from './config';
import {
  ACCESS_CONTROL_MAX_AGE,
  ACCESS_CONTROL_EXPOSE_HEADERS,
  ACCESS_CONTROL_ALLOW_CREDENTIALS,
  ACCESS_CONTROL_ALLOW_METHODS,
  ACCESS_CONTROL_ALLOW_HEADERS,
  ACCESS_CONTROL_ALLOW_ORIGIN,
} from './constants';
import type { Header, NextCorsMiddleware } from './types';

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
   * @usage
   * ```ts
   * export const middleware = createCorsMiddleware(config);
   * ```
   */
  const corsMiddleware = (request: NextRequest, response?: NextResponse) => {
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

  return corsMiddleware;
};

export default createCorsMiddleware;
