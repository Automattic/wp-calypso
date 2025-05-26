import type { AuthProvider } from '../types/index.js';

/**
 * Create an auth provider from environment variables or CLI token
 * Returns empty headers if no authentication is configured
 * @param cliToken
 */
export function createEnvAuthProvider(cliToken?: string): AuthProvider {
	return async (): Promise<Record<string, string>> => {
		const headers: Record<string, string> = {};

		// Check CLI token first, then environment variables in order of priority
		const token = cliToken || process.env.JETPACK_JWT;

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		// Returns empty object if no token found - no auth headers
		return headers;
	};
}
