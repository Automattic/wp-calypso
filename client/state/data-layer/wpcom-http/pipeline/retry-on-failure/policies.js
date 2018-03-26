/** @format */

export const exponentialBackoff = ( { delay = 1000, maxAttempts = 3 } = {} ) => ( {
	name: 'EXPONENTIAL_BACKOFF',
	delay: Math.max( 500, delay ),
	maxAttempts: Math.min( 5, maxAttempts ),
	allowedMethods: [ 'GET' ],
} );

export const exponentialBackoffExplicitPost = ( { delay, maxAttempts } = {} ) => ( {
	...exponentialBackoff( delay, maxAttempts ),
	allowedMethods: [ 'POST' ],
	name: 'EXPONENTIAL_BACKOFF_EXPLICIT_POST',
} );

export const noRetry = () => ( {
	name: 'NO_RETRY',
} );

export default exponentialBackoff();
