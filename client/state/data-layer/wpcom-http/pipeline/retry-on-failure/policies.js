export const exponentialBackoff = ( { delay = 500, maxAttempts = 3 } = {} ) => ( {
	name: 'EXPONENTIAL_BACKOFF',
	delay: Math.max( 500, delay ),
	maxAttempts: Math.min( 5, maxAttempts ),
} );

export const noRetry = () => ( {
	name: 'NO_RETRY',
} );

export const simpleRetry = ( { delay = 1000, maxAttempts = 1 } = {} ) => ( {
	name: 'SIMPLE_RETRY',
	delay: Math.max( 500, delay ),
	maxAttempts: Math.min( 5, maxAttempts ),
} );

export default exponentialBackoff();
