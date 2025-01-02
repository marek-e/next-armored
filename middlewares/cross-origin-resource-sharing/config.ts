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

type CorsConfigDefaults = {
  origins: undefined;
  methods: Method[];
  headers: string[];
  allowCredentials: boolean;
  exposedHeaders: string[];
  preflightContinue: boolean;
  maxAge: number;
  optionsSuccessStatus: number;
};

/**
 * @default origins is undefined, you must specify it manually to prevent unwanted * which can be a security risk
 * @default methods is ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
 * @default headers is ['Content-Type', 'Authorization']
 * @default allowCredentials is true
 * @default preflightContinue is false
 * @default optionsSuccessStatus is 204
 * @default exposedHeaders is []
 * @default maxAge is 1 day
 */
export const DEFAULT_CORS_CONFIG: CorsConfigDefaults = {
  origins: undefined, // Required -> DO NOT USE * by default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
  allowCredentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: [],
  maxAge: 60 * 60 * 24, // 1 day
};
