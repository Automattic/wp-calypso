export const MILLISECONDS_PER_SECOND = 1000;

let lastNow = Date.now();
/**
 * Returns the time in miliseconds.
 * A strictly increasing version of Date.now()
 */
export function monotonicNow() {
	const maybeNow = Date.now();

	lastNow = lastNow < maybeNow ? maybeNow : lastNow + 1;

	return lastNow;
}

export function createUnresolvingPromise< T >() {
	return new Promise< T >( ( res ) => {} );
}

/**
 * Timeouts a promise. Returns timeoutValue in event of timeout.
 *
 * @param promise
 * @param ms
 * @param timeoutValue
 */
export function timeoutPromise< T, TimeoutValue = null >(
	promise: Promise< T >,
	ms: number,
	timeoutValue: TimeoutValue = null
): Promise< T | TimeoutValue > {
	return Promise.race( [
		promise,
		new Promise< TimeoutValue >( ( res ) => setTimeout( () => res( timeoutValue ), ms ) ),
	] );
}

export function asyncOneAtATime< T >( f: () => Promise< T > ): () => Promise< T > {
	let isRunning = false;
	let lastPromise = createUnresolvingPromise< T >();
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
		return lastPromise;
	};
}
