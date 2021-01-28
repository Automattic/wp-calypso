export const MILLISECONDS_PER_SECOND = 1000;

let lastNow = Date.now();
/**
 * Returns the time in miliseconds.
 * A strictly increasing version of Date.now()
 *
 * Gives us some minimimal guarentees about user clocks.
 */
export function monotonicNow(): number {
	const maybeNow = Date.now();

	lastNow = lastNow < maybeNow ? maybeNow : lastNow + 1;

	return lastNow;
}

/**
 * Timeouts a promise. Returns timeoutValue in event of timeout.
 *
 * @param promise The promise to timeout
 * @param timeoutMilliseconds The timeout time in milliseconds
 */
export function timeoutPromise< T >(
	promise: Promise< T >,
	timeoutMilliseconds: number
): Promise< T | null > {
	return Promise.race( [
		promise,
		new Promise< null >( ( _res, rej ) =>
			setTimeout( () => rej( new Error( 'Promise has timed-out.' ) ), timeoutMilliseconds )
		),
	] );
}

/**
 * Wraps an async function so that if it is called multiple times it will just return the same promise - until the promise is fulfilled.
 *
 * Once the promise has been fulfilled it will reset.
 *
 * @param f The function to wrap
 */
export function asyncOneAtATime< T >( f: () => Promise< T > ): () => Promise< T > {
	let isRunning = false;
	let lastPromise: Promise< T > | null = null;
	return async () => {
		if ( ! isRunning ) {
			isRunning = true;
			lastPromise = f();
			const afterwards = () => {
				isRunning = false;
			};
			lastPromise.then( afterwards );
			lastPromise.catch( afterwards );
		}
		if ( lastPromise === null ) {
			throw new Error( 'Invalid state: lastPromise should not be null.' );
		}
		return lastPromise;
	};
}
