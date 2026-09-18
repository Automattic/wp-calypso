/**
 * Rejects when the promise has had its time.
 *
 * Playwright's own test timeout aborts from the outside and cannot be caught, so
 * anything that has to stay inside a budget — a fixture teardown, a setup
 * project that other projects depend on — needs a deadline of its own.
 *
 * The losing promise keeps running and may reject later with nobody waiting on
 * it, which Playwright charges to whatever test is running by then, so it is
 * given a handler here.
 */
export function withDeadline< T >( promise: Promise< T >, timeoutMs: number ): Promise< T > {
	promise.catch( () => {} );

	let timer: NodeJS.Timeout | undefined;
	return Promise.race( [
		promise,
		new Promise< never >( ( _resolve, reject ) => {
			timer = setTimeout(
				() => reject( new Error( `timed out after ${ timeoutMs }ms` ) ),
				timeoutMs
			);
		} ),
	] ).finally( () => clearTimeout( timer ) );
}
