/**
 * Dispatcher interface for handling HTTP requests with optional proxy support
 */
export interface RequestDispatcher {
	/**
	 * Create fetch options with optional proxy configuration
	 *
	 * @param headers - Request headers
	 * @param body    - Request body
	 * @param signal  - Abort signal
	 * @param proxy   - Optional proxy configuration
	 * @return Fetch options with optional dispatcher
	 */
	createFetchOptions(
		headers: Record< string, string >,
		body: string,
		signal: AbortSignal,
		proxy?: string
	): RequestInit & { dispatcher?: any };
}

/**
 * Browser-compatible dispatcher that doesn't support SOCKS proxies
 */
export class BrowserDispatcher implements RequestDispatcher {
	createFetchOptions(
		headers: Record< string, string >,
		body: string,
		signal: AbortSignal,
		proxy?: string
	): RequestInit & { dispatcher?: any } {
		const options: RequestInit = {
			method: 'POST',
			headers,
			body,
			signal,
		};

		// Browser environments don't support SOCKS proxies via fetch
		// Log a warning if proxy is requested
		if ( proxy ) {
			console.warn(
				'Proxy configuration is not supported in browser environments:',
				proxy
			);
		}

		return options;
	}
}

/**
 * Default dispatcher instance for browser environments
 */
export const defaultDispatcher = new BrowserDispatcher();
