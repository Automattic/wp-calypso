/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
/**
 * Types
 */
import type { WpcomRequestParams } from 'wpcom-proxy-request';

const MAX_CONCURRENT_REQUESTS = 5;

let concurrentCounter = 0;
let lastCallTimestamp: number | null = null;

/**
 * Concurrency-limited request to wpcom-proxy-request.
 * @param { WpcomRequestParams } params - The request params.
 * @returns { Promise }                   The response.
 * @throws { Error }                      If there are too many concurrent requests.
 */
export default async function wpcomLimitedRequest< T >( params: WpcomRequestParams ): Promise< T > {
	concurrentCounter += 1;

	if ( concurrentCounter > MAX_CONCURRENT_REQUESTS ) {
		concurrentCounter -= 1;
		throw new Error( 'Too many requests' );
	}

	const now = Date.now();

	// Check if the last call was made less than 100 milliseconds ago
	if ( lastCallTimestamp && now - lastCallTimestamp < 100 ) {
		concurrentCounter -= 1;
		throw new Error( 'Too many requests' );
	}

	lastCallTimestamp = now; // Update the timestamp

	return wpcomProxyRequest< T >( params ).finally( () => {
		concurrentCounter -= 1;
	} );
}
