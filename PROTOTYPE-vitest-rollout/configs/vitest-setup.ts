import '@testing-library/jest-dom/vitest';
import nodeCrypto from 'node:crypto';
import { ReadableStream, TransformStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { Worker } from 'node:worker_threads';
import nock from 'nock';
import ResizeObserver from 'resize-observer-polyfill';
import { afterAll, vi } from 'vitest';

( globalThis as any ).jest = {
	fn: vi.fn,
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};
( globalThis as any ).google = {};
globalThis.CSS = { ...globalThis.CSS, supports: vi.fn() } as any;

const isJsdom = typeof window !== 'undefined';
if ( isJsdom ) {
	Object.setPrototypeOf( globalThis.DOMException.prototype, Error.prototype );
	// jest-canvas-mock calls `jest.fn` at import time.
	const shim = ( globalThis as any ).jest;
	( globalThis as any ).jest = vi;
	await import( 'jest-canvas-mock' );
	( globalThis as any ).jest = shim;
}

if ( typeof globalThis.MessageChannel === 'undefined' ) {
	class PolyfilledMessagePort {
		onmessage: ( ( e: { data: unknown } ) => void ) | null = null;
		_target: PolyfilledMessagePort | null = null;
		postMessage( data: unknown ) {
			const target = this._target;
			setTimeout( () => target?.onmessage?.( { data } ), 0 );
		}
		addEventListener() {}
		removeEventListener() {}
		start() {}
		close() {}
	}
	( globalThis as any ).MessagePort = PolyfilledMessagePort;
	( globalThis as any ).MessageChannel = class {
		port1 = new PolyfilledMessagePort();
		port2 = new PolyfilledMessagePort();
		constructor() {
			this.port1._target = this.port2;
			this.port2._target = this.port1;
		}
	};
}

if ( ! nock.isActive() ) nock.activate();
nock.disableNetConnect();
afterAll( async () => {
	await new Promise( ( r ) => setTimeout( r, 0 ) );
	nock.abortPendingRequests();
	nock.restore();
	nock.cleanAll();
} );

globalThis.TextEncoder = TextEncoder as any;
globalThis.TextDecoder = TextDecoder as any;
globalThis.ResizeObserver = ResizeObserver;
( globalThis as any ).IntersectionObserver = class {
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

vi.mock( 'wpcom-proxy-request', () => ( {
	canAccessWpcomApis: vi.fn(),
	isCookieAuthMissing: vi.fn( () => false ),
	reloadProxy: vi.fn(),
	requestAllBlogsAccess: vi.fn(),
	default: vi.fn(),
} ) );
vi.mock( 'smooch', () => ( { default: {} } ) );
vi.mock( '@automattic/agenttic-client', () => ( {
	getAgentManager: vi.fn( () => ( { createAgent: vi.fn(), getAgent: vi.fn() } ) ),
	useAgentChat: vi.fn( () => ( { messages: [], isLoading: false, sendMessage: vi.fn(), clearMessages: vi.fn() } ) ),
} ) );
vi.mock( '@automattic/agenttic-ui', () => ( {
	ThinkingMessage: vi.fn( () => 'Thinking...' ),
	AgentUI: vi.fn( () => null ),
	createMessageRenderer: vi.fn(),
	EmptyView: vi.fn( () => null ),
} ) );

globalThis.crypto.randomUUID = () => nodeCrypto.randomUUID() as any;
( globalThis as any ).matchMedia = vi.fn( ( query: string ) => ( {
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
} ) );
( globalThis as any ).ReadableStream = ReadableStream;
( globalThis as any ).TransformStream = TransformStream;
( globalThis as any ).Worker = Worker;
if ( typeof globalThis.structuredClone !== 'function' ) {
	globalThis.structuredClone = ( obj: any ) => JSON.parse( JSON.stringify( obj ) );
}
if ( ! globalThis.crypto.subtle ) {
	( globalThis.crypto as any ).subtle = nodeCrypto.subtle;
}
