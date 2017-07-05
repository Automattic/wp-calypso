/**
 * Internal dependencies
 */
import analytics from './index';

export function logTimingOfNextTick() {
	/*
	 * Call setImmediate once to enqueue a function at the end of the current
	 * iteration of the event loop. From within the queued function, call
	 * setImmedate a second time to schedule a callback to be called at the end
	 * of the following event loop. As per the documentation, a setImmediate
	 * callback scheduled within another setImmediate callback is guaranteed to
	 * be run in the following iteration of the event loop.
	 *
	 * See:
	 * https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
	 * https://nodejs.org/api/timers.html#timers_setimmediate_callback_args
	 */
	setImmediate( () => {
		const startTime = new Date();

		setImmediate( () => {
			analytics.statsd.recordTiming(
				'tick-timer', 'timing', new Date() - startTime
			);
		} );
	} );
}

export function startTickTimer( interval ) {
	return setInterval( logTimingOfNextTick, interval );
}

export function stopTickTimer( timer ) {
	clearInterval( timer );
}
