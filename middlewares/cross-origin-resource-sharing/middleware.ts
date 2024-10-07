import { NextResponse, NextFetchEvent, NextRequest } from 'next/server';
import type { NextMiddleware } from 'next/server';
import type { CorsConfig, Method, Origin } from './config';
import { DEFAULT_CORS_CONFIG } from './config';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';

const ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
const ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';
const ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods';
const ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers';
const ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
const ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age';

type NextCorsMiddleware = (request: NextRequest) => NextMiddlewareResult;

interface Header {
  key: string;
  value: string;
}

/**
 * @description
 * @param config
 * @returns
 */
const createCorsMiddleware = ({
  origins,
  methods = DEFAULT_CORS_CONFIG.methods,
  headers = DEFAULT_CORS_CONFIG.headers,
  allowCredentials = DEFAULT_CORS_CONFIG.allowCredentials,
  exposedHeaders = DEFAULT_CORS_CONFIG.exposedHeaders,
  maxAge = DEFAULT_CORS_CONFIG.maxAge,
  optionsSuccessStatus = DEFAULT_CORS_CONFIG.optionsSuccessStatus,
  preflightContinue = DEFAULT_CORS_CONFIG.preflightContinue,
}: CorsConfig): NextCorsMiddleware => {
  console.log('createCorsMiddleware');
  // const configWithDefaults = { ...DEFAULT_CORS_CONFIG, ...config };
  // const {
  //   origins,
  //   methods,
  //   headers,
  //   allowCredentials,
  //   exposedHeaders,
  //   maxAge,
  //   optionsSuccessStatus,
  //   preflightContinue,
  // } = configWithDefaults;

  const corsOptions = {
    ACCESS_CONTROL_ALLOW_METHODS: methods.join(', '),
    ACCESS_CONTROL_ALLOW_HEADERS: headers.join(', '),
    ACCESS_CONTROL_ALLOW_CREDENTIALS: allowCredentials ? 'true' : 'false',
    ...(exposedHeaders.length > 0
      ? { ACCESS_CONTROL_EXPOSE_HEADERS: exposedHeaders.join(', ') }
      : {}),
    ...(maxAge ? { ACCESS_CONTROL_MAX_AGE: maxAge.toString() } : {}),
  };

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
    console.log('getIsOriginAllowed', origin, allowedOrigins);
    if (allowedOrigins.length === 0) {
      return { result: false };
    }
    // if contains '*', allow all origins
    if (allowedOrigins.includes('*')) {
      return { result: true, origin };
    }
    // if (allowedOrigins.length === 1) {
    //   return { result: allowedOrigins[0] === origin, origin: '' };
    // }
    // allowedOrigins.forEach(allowedOrigin => {
    //   if (typeof allowedOrigin === 'string') {
    //     if (allowedOrigin === origin) {
    //       return { result: true, origin };
    //     }
    //   } else if (allowedOrigin instanceof RegExp) {
    //     if (allowedOrigin.test(origin)) {
    //       return { result: true, origin };
    //     }
    //   }
    // });
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

  const middleware = (request: NextRequest) => {
    const origin = request.headers.get('origin') ?? '';
    const isOriginAllowed = getIsOriginAllowed(origin, origins);
    console.log('isOriginAllowed', isOriginAllowed);
    const optionsHeaders: Header[] = [];
    optionsHeaders.push(configureMaxAge(maxAge));
    optionsHeaders.push(configureExposedHeaders(exposedHeaders as string[]));
    optionsHeaders.push(configureAllowCredentials(allowCredentials));
    optionsHeaders.push(configureAllowMethods(methods as Method[]));
    optionsHeaders.push(configureAllowHeaders(headers as string[]));

    if (isOriginAllowed.result) {
      optionsHeaders.push(configureAllowOrigin(isOriginAllowed.origin));
    }

    const isPreflight = request.method === 'OPTIONS';

    if (isPreflight) {
      // const preflightHeaders = {
      //   ...(isOriginAllowed && { 'Access-Control-Allow-Origin': origin }),
      //   ...corsOptions,
      // };
      if (preflightContinue) {
        const response = NextResponse.next();
        optionsHeaders.forEach(({ key, value }) => {
          response.headers.set(key, value);
        });
        return response;
      }
      return NextResponse.json(
        {},
        {
          headers: optionsHeaders.map(header => [header.key, header.value]),
          status: optionsSuccessStatus,
        },
      );
    }

    const response = NextResponse.next();

    // Object.entries(corsOptions).forEach(([key, value]) => {
    //   response.headers.set(key, value);
    // });
    optionsHeaders.forEach(({ key, value }) => {
      response.headers.set(key, value);
    });

    return response;
  };

  return middleware;
};

export default createCorsMiddleware;
