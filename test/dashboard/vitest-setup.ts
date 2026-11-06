// PROTOTYPE (DOTMSD-1656): Vitest port of calypso-jest's setup files, test/client/setup-globals.js
// and test/client/setup-dashboard-test-framework.js.
import '@testing-library/jest-dom/vitest';
import { TextDecoder, TextEncoder } from 'node:util';
import nock from 'nock';
import ResizeObserver from 'resize-observer-polyfill';
import { afterEach, vi } from 'vitest';

// Hybrid migration: test files keep `jest.fn()` etc. Only `jest.mock` / `jest.requireActual`
// are codemodded, because Vitest hoists mocks written on `vi` alone.
( globalThis as any ).jest = vi;

// vm pools and jsdom may lack Node's web platform classes, which nock needs. Borrow them, as
// calypso-jest's setup-globals does.
{
	const { runInThisContext } = await import( 'node:vm' );
	const nodeGlobals = runInThisContext( 'globalThis' );
	for ( const name of [
		'Headers',
		'Request',
		'Response',
		'FormData',
		'TextEncoder',
		'TextDecoder',
		'ReadableStream',
		'WritableStream',
		'TransformStream',
		'fetch',
	] ) {
		if ( typeof ( globalThis as any )[ name ] === 'undefined' ) {
			( globalThis as any )[ name ] = nodeGlobals[ name ];
		}
	}
}

( globalThis as any ).google = {};

// Keep `CSS.escape`, which jest-dom's `css.escape` dependency has already polyfilled.
globalThis.CSS = { ...globalThis.CSS, supports: vi.fn() } as any;

const isJsdom = typeof window !== 'undefined';

if ( isJsdom ) {
	// jsdom's DOMException comes from another realm, so `instanceof Error` is false under Vitest.
	Object.setPrototypeOf( globalThis.DOMException.prototype, Error.prototype );
}

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
	( globalThis as any ).MessagePort = PolyfilledMessagePort;
	( globalThis as any ).MessageChannel = class MessageChannel {
		port1 = new PolyfilledMessagePort();
		port2 = new PolyfilledMessagePort();
		constructor() {
			this.port1._target = this.port2;
			this.port2._target = this.port1;
		}
	};
}

nock.disableNetConnect();

afterEach( () => {
	nock.cleanAll();
	vi.clearAllMocks();
} );

globalThis.TextEncoder = TextEncoder as any;
globalThis.TextDecoder = TextDecoder as any;
globalThis.ResizeObserver = ResizeObserver;

if (
	typeof globalThis.Element !== 'undefined' &&
	typeof globalThis.Element.prototype.scrollIntoView !== 'function'
) {
	globalThis.Element.prototype.scrollIntoView = function () {};
}

if ( typeof globalThis.structuredClone !== 'function' ) {
	globalThis.structuredClone = ( obj: any ) => JSON.parse( JSON.stringify( obj ) );
}

( globalThis as any ).IntersectionObserver = class IntersectionObserver {
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

if ( isJsdom ) {
	await import( 'jest-canvas-mock' );
	window.matchMedia = vi.fn( ( query: string ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	} ) ) as any;
}
