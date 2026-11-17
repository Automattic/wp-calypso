import '@testing-library/jest-dom/vitest';
import nodeCrypto from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';
import { Worker } from 'node:worker_threads';
import nock from 'nock';
import ResizeObserver from 'resize-observer-polyfill';
import { afterAll, vi } from 'vitest';

const isJsdom = typeof window !== 'undefined';
const testGlobals = globalThis as unknown as Record< string, unknown >;

// Test helpers shared with tests still on Jest call these.
testGlobals.jest = {
	fn: vi.fn,
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};

if ( isJsdom ) {
	await import( 'vitest-canvas-mock' );
}

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

if ( ! nock.isActive() ) {
	nock.activate();
}
// Fail any network requests which aren't mocked.
nock.disableNetConnect();

// Node's `http` outlives each file's vm context under `vmForks`, so unpatch it when the file ends.
afterAll( async () => {
	// A test that left fake timers on would stop this timeout from firing.
	vi.useRealTimers();
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	nock.abortPendingRequests();
	nock.restore();
	nock.cleanAll();
} );

// For ReactDOMServer.
testGlobals.TextEncoder = TextEncoder;
testGlobals.TextDecoder = TextDecoder;

globalThis.ResizeObserver = ResizeObserver;

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

// It reads `document` when it loads.
vi.mock( 'wpcom-proxy-request', () => ( {
	canAccessWpcomApis: vi.fn(),
	isCookieAuthMissing: vi.fn( () => false ),
	reloadProxy: vi.fn(),
	requestAllBlogsAccess: vi.fn(),
} ) );

vi.mock( 'smooch', () => ( {} ) );

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

globalThis.crypto.randomUUID = () => nodeCrypto.randomUUID();

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

// For @wp-playground/client.
testGlobals.Worker = Worker;
if ( ! globalThis.crypto.subtle ) {
	Object.assign( globalThis.crypto, { subtle: nodeCrypto.subtle } );
}
