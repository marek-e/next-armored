import { NextResponse, NextRequest } from 'next/server';
import type { CorsConfig, PathOptions } from './types';
import { DEFAULT_CORS_CONFIG } from './config';
import {
  configureAllowCredentials,
  configureAllowHeaders,
  configureAllowMethods,
  configureAllowOrigin,
  configureExposedHeaders,
  configureMaxAge,
  getIsOriginAllowed,
  isPathIncluded,
} from './utils';
import type { Header, NextCorsMiddleware } from './types';

/**
 * CORS middleware builder
 * @param config - The CORS configuration (origins, methods, headers, etc.)
 * @param pathOptions - Path options selector (includes, excludes) to enable or disable CORS for specific paths
 * @returns The corsMiddleware function
 * @usage
 * ```ts
 * export const corsMiddleware = createCorsMiddleware(config, pathOptions);
 * ```
 */
const createCorsMiddleware = (
  config: CorsConfig,
  pathOptions: PathOptions = {},
): NextCorsMiddleware => {
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
    const nextResponse = response ?? NextResponse.next();
    const pathname = request.nextUrl.pathname;
    if (
      pathOptions.excludes !== undefined &&
      isPathIncluded(pathname, pathOptions.excludes)
    ) {
      return nextResponse;
    }

    if (
      pathOptions.includes !== undefined &&
      !isPathIncluded(pathname, pathOptions.includes)
    ) {
      return nextResponse;
    }

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

    optionsHeaders.forEach(({ key, value }) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  };

  return corsMiddleware;
};

export default createCorsMiddleware;
