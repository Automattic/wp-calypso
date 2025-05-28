import { socksDispatcher } from 'fetch-socks';
import type { RequestDispatcher } from '../client/utils/dispatcher';
import { logger } from '../client/utils/logger';

/**
 * Node.js-specific dispatcher that supports SOCKS proxies
 */
export class NodeDispatcher implements RequestDispatcher {
	createFetchOptions(
		headers: Record< string, string >,
		body: string,
		signal: AbortSignal,
		proxy?: string
	): RequestInit & { dispatcher?: any } {
		const options: RequestInit & { dispatcher?: any } = {
			method: 'POST',
			headers,
			body,
			signal,
		};

		// Add proxy agent if proxy is configured
		// For SOCKS proxy, we use fetch-socks dispatcher
		if ( proxy ) {
			try {
				// Parse the SOCKS proxy URL (e.g., "socks://127.0.0.1:8080")
				const url = new URL( proxy );
				const dispatcher = socksDispatcher( {
					type: 5, // SOCKS5
					host: url.hostname,
					port: parseInt( url.port, 10 ),
				} );
				options.dispatcher = dispatcher;
			} catch ( error ) {
				// If proxy setup fails, log warning but continue without proxy
				logger( 'Warning: Failed to setup proxy %s: %s', proxy, error );
			}
		}

		return options;
	}
}

/**
 * Default Node.js dispatcher instance
 */
export const nodeDispatcher = new NodeDispatcher();
