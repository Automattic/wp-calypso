// JSDOM doesn't implement `fetch()`, so borrow Node's. This has to run before `nock` is loaded in
// `setup-test-framework.js`, because `nock` patches the `fetch()` that exists when it loads.
// Node's `fetch()` rejects JSDOM's `AbortSignal`, so tests that pass a `signal` need `@jest-environment node`.
if ( typeof global.fetch === 'undefined' ) {
	global.fetch = require( 'node:vm' ).runInThisContext( 'globalThis' ).fetch;
}

// JSDOM 20 has no `PointerEvent`, which Base UI constructs when a checkbox is clicked.
if ( typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined' ) {
	window.PointerEvent = class PointerEvent extends window.MouseEvent {
		constructor( type, init = {} ) {
			super( type, init );
			this.pointerId = init.pointerId ?? 0;
			this.pointerType = init.pointerType ?? '';
		}
	};
}
