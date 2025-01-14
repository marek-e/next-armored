import {
  ACCESS_CONTROL_MAX_AGE,
  ACCESS_CONTROL_EXPOSE_HEADERS,
  ACCESS_CONTROL_ALLOW_CREDENTIALS,
  ACCESS_CONTROL_ALLOW_METHODS,
  ACCESS_CONTROL_ALLOW_HEADERS,
  ACCESS_CONTROL_ALLOW_ORIGIN,
} from './constants';
import type {
  Header,
  IsOriginAllowedResult,
  Method,
  Origin,
  PathMatcher,
} from './types';

export function isPathMatching(
  url: string,
  pathMatcher: PathMatcher,
  includeOption: 'every' | 'some' = 'every',
) {
  const { startWith, additionalIncludes } = pathMatcher;
  const isMatching = url.startsWith(startWith);
  if (isMatching && additionalIncludes !== undefined) {
    if (includeOption === 'every') {
      return additionalIncludes.every(path => url.includes(path));
    }
    return additionalIncludes.some(path => url.includes(path));
  }
  return isMatching;
}

export function isPathIncluded(path: string, pathToMatch: PathMatcher[]) {
  return pathToMatch.some(pathMatcher => isPathMatching(path, pathMatcher));
}

export function configureMaxAge(maxAge: number): Header {
  return {
    key: ACCESS_CONTROL_MAX_AGE,
    value: maxAge.toString(),
  };
}

export function configureExposedHeaders(exposedHeaders: string[]): Header {
  return {
    key: ACCESS_CONTROL_EXPOSE_HEADERS,
    value: exposedHeaders.join(', '),
  };
}

export function configureAllowCredentials(allowCredentials: boolean): Header {
  return {
    key: ACCESS_CONTROL_ALLOW_CREDENTIALS,
    value: allowCredentials ? 'true' : 'false',
  };
}

export function configureAllowMethods(methods: Method[]): Header {
  return {
    key: ACCESS_CONTROL_ALLOW_METHODS,
    value: methods.join(', '),
  };
}

export function configureAllowHeaders(headers: string[]): Header {
  return {
    key: ACCESS_CONTROL_ALLOW_HEADERS,
    value: headers.join(', '),
  };
}

export function configureAllowOrigin(origin: string): Header {
  return {
    key: ACCESS_CONTROL_ALLOW_ORIGIN,
    value: origin,
  };
}

export function getIsOriginAllowed(
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
