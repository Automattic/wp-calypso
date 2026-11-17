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
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	nock.abortPendingRequests();
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
