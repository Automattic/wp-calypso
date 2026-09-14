// This is used by @wordpress/components in https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/ui/utils/space.ts#L33
// JSDOM or CSSDOM don't provide an implementation for it, so for now we have to mock it.
global.CSS = {
	supports: jest.fn(),
};

// React 19's `react-dom/server.browser` build and the `scheduler` package
// reference `MessageChannel` at module-evaluation time, but JSDOM does not
// provide it. Provide a minimal pure-JS implementation.
//
// Two constraints:
//   1. Avoid Node's worker_threads MessageChannel — its ports hold libuv
//      handles that keep the Jest worker alive ("worker failed to exit
//      gracefully" / detected open handles), hanging whole suites.
//   2. Deliver messages on a macrotask (setTimeout), not a microtask. React's
//      scheduler uses MessageChannel to *yield to the host*; a microtask does
//      not yield to timers/I/O and starves them, which dramatically slows down
//      (and times out) tests. setTimeout matches the scheduler's own fallback
//      when MessageChannel is absent, and its timer handles are transient.
if ( typeof global.MessageChannel === 'undefined' ) {
	class PolyfilledMessagePort {
		constructor() {
			this.onmessage = null;
			this._target = null;
		}
		postMessage( data ) {
			const target = this._target;
			setTimeout( () => {
				if ( target && typeof target.onmessage === 'function' ) {
					target.onmessage( { data } );
				}
			}, 0 );
		}
		addEventListener() {}
		removeEventListener() {}
		start() {}
		close() {}
	}
	global.MessagePort = PolyfilledMessagePort;
	global.MessageChannel = class MessageChannel {
		constructor() {
			this.port1 = new PolyfilledMessagePort();
			this.port2 = new PolyfilledMessagePort();
			this.port1._target = this.port2;
			this.port2._target = this.port1;
		}
	};
}
