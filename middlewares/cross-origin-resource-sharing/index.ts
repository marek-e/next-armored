import createCorsMiddleware from './middleware';
import type { CorsConfig } from './config';
import { DEFAULT_CORS_CONFIG } from './config';

export default createCorsMiddleware;

export { DEFAULT_CORS_CONFIG, type CorsConfig, createCorsMiddleware };
