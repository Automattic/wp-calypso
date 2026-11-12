import '@testing-library/jest-dom/vitest';
import { TextDecoder, TextEncoder } from 'node:util';
import nock from 'nock';
import ResizeObserver from 'resize-observer-polyfill';
import { afterAll, afterEach, vi } from 'vitest';

const isJsdom = typeof window !== 'undefined';
const testGlobals = globalThis as unknown as Record< string, unknown >;

if ( isJsdom ) {
	await import( 'vitest-canvas-mock' );
}

// React Testing Library's `waitFor` only advances fake timers when it finds a global `jest`.
testGlobals.jest = {
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};

testGlobals.google = {};

// @wordpress/components calls `CSS.supports()`, which jsdom lacks. Keep `CSS.escape`, which
// jest-dom's `css.escape` dependency has already polyfilled.
testGlobals.CSS = { ...globalThis.CSS, supports: vi.fn() };

if ( isJsdom ) {
	// jsdom's DOMException comes from another realm, so `instanceof Error` is false under Vitest.
	Object.setPrototypeOf( globalThis.DOMException.prototype, Error.prototype );

	// jsdom 20 has no `PointerEvent`, which Base UI constructs when a checkbox is clicked.
	if ( typeof window.PointerEvent === 'undefined' ) {
		testGlobals.PointerEvent = class PointerEvent extends window.MouseEvent {
			pointerId: number;
			pointerType: string;
			constructor( type: string, init: PointerEventInit = {} ) {
				super( type, init );
				this.pointerId = init.pointerId ?? 0;
				this.pointerType = init.pointerType ?? '';
			}
		};
	}
}

// React 19's `react-dom/server.browser` build and `scheduler` need `MessageChannel` at load time.
// Node's holds libuv handles that keep workers alive, and a microtask wouldn't yield to timers the
// way the scheduler expects, so deliver messages with `setTimeout`.
if ( typeof globalThis.MessageChannel === 'undefined' ) {
	class PolyfilledMessagePort {
		onmessage: ( ( e: { data: unknown } ) => void ) | null = null;
		_target: PolyfilledMessagePort | null = null;
		postMessage( data: unknown ) {
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
	testGlobals.MessagePort = PolyfilledMessagePort;
	testGlobals.MessageChannel = class MessageChannel {
		port1 = new PolyfilledMessagePort();
		port2 = new PolyfilledMessagePort();
		constructor() {
			this.port1._target = this.port2;
			this.port2._target = this.port1;
		}
	};
}

if ( ! nock.isActive() ) {
	nock.activate();
}
// Fail any network requests which aren't mocked.
nock.disableNetConnect();

// Node's `http` outlives each file's vm context under `vmForks`, so unpatch it when the file ends.
// A request still in flight schedules its reply only after reading its body, so one abort can miss
// it, and the reply then lands in the torn-down context.
afterAll( async () => {
	for ( let pass = 0; pass < 5; pass++ ) {
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		nock.abortPendingRequests();
	}
	nock.restore();
} );

afterEach( () => {
	nock.cleanAll();
	vi.clearAllMocks();
} );

// For ReactDOMServer.
testGlobals.TextEncoder = TextEncoder;
testGlobals.TextDecoder = TextDecoder;

globalThis.ResizeObserver = ResizeObserver;

// jsdom doesn't implement scrollIntoView, which @wordpress/components' ComboboxControl calls when
// navigating its suggestion list with the arrow keys.
if (
	typeof globalThis.Element !== 'undefined' &&
	typeof globalThis.Element.prototype.scrollIntoView !== 'function'
) {
	globalThis.Element.prototype.scrollIntoView = function () {};
}

// jsdom doesn't implement scrollTo: on an element it's missing, and on the window it logs a
// "Not implemented" error. The Dashboard's DataViews wrapper calls one or the other after a page
// change.
if ( typeof globalThis.Element !== 'undefined' ) {
	globalThis.Element.prototype.scrollTo = function () {};
}
if ( isJsdom ) {
	window.scrollTo = function () {};
}

if ( typeof globalThis.structuredClone !== 'function' ) {
	testGlobals.structuredClone = ( obj: unknown ) => JSON.parse( JSON.stringify( obj ) );
}

// @wordpress/dataviews' infinite-scroll hook needs IntersectionObserver, which jsdom lacks.
testGlobals.IntersectionObserver = class IntersectionObserver {
	root = null;
	rootMargin = '';
	thresholds = [];
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
};

vi.mock( '@automattic/agenttic-client', () => ( {
	getAgentManager: vi.fn( () => ( {
		createAgent: vi.fn(),
		getAgent: vi.fn(),
	} ) ),
	useAgentChat: vi.fn( () => ( {
		messages: [],
		isLoading: false,
		sendMessage: vi.fn(),
		clearMessages: vi.fn(),
	} ) ),
} ) );

vi.mock( '@automattic/agenttic-ui', () => ( {
	ThinkingMessage: vi.fn( () => 'Thinking...' ),
	AgentUI: vi.fn( () => null ),
	createMessageRenderer: vi.fn(),
	EmptyView: vi.fn( () => null ),
} ) );

testGlobals.matchMedia = vi.fn( ( query: string ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
} ) );
