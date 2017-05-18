export const exponentialBackoff = ( { delay = 500, maxTries = 3 } = {} ) => ( {
	name: 'EXPONENTIAL_BACKOFF',
	delay: Math.max( 500, delay ),
	maxTries: Math.min( 5, maxTries ),
} );

export const noRetry = () => ( {
	name: 'NO_RETRY',
} );

export const simpleRetry = ( { delay = 1000, maxTries = 1 } = {} ) => ( {
	name: 'SIMPLE_RETRY',
	delay: Math.max( 500, delay ),
	maxTries: Math.min( 5, maxTries ),
} );

export default exponentialBackoff();
