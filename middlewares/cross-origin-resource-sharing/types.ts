import type { NextMiddlewareResult } from 'next/dist/server/web/types';
import type { NextResponse, NextRequest } from 'next/server';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type Origin = string | RegExp;

export type CorsConfig = {
  origins: Origin[];
  methods?: Method[];
  headers?: string[];
  allowCredentials?: boolean;
  exposedHeaders?: string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
};

export type NextCorsMiddleware = (
  request: NextRequest,
  response?: NextResponse,
) => NextMiddlewareResult;

export type IsOriginAllowedResult =
  | {
      result: false;
    }
  | {
      result: true;
      origin: string;
    };

export type Header = {
  key: string;
  value: string;
};

export type PathMatcher = {
  startWith: string;
  additionalIncludes?: string[];
};

export type PathOptions = {
  includes?: PathMatcher[];
  excludes?: PathMatcher[];
};
