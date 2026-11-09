import '@testing-library/jest-dom/vitest';
import { TextDecoder, TextEncoder } from 'node:util';
import ResizeObserver from 'resize-observer-polyfill';
import { vi } from 'vitest';

( globalThis as any ).jest = { advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ) };
if ( typeof window !== 'undefined' ) {
	Object.setPrototypeOf( globalThis.DOMException.prototype, Error.prototype );
}
if ( typeof globalThis.MessageChannel === 'undefined' ) {
	class Port {
		onmessage: any = null;
		_target: any = null;
		postMessage( data: unknown ) {
			const t = this._target;
			setTimeout( () => t?.onmessage?.( { data } ), 0 );
		}
		addEventListener() {}
		removeEventListener() {}
		start() {}
		close() {}
	}
	( globalThis as any ).MessagePort = Port;
	( globalThis as any ).MessageChannel = class {
		port1 = new Port();
		port2 = new Port();
		constructor() {
			this.port1._target = this.port2;
			this.port2._target = this.port1;
		}
	};
}
globalThis.crypto.randomUUID = () => 'fake-uuid' as any;
globalThis.TextEncoder = TextEncoder as any;
globalThis.TextDecoder = TextDecoder as any;
globalThis.ResizeObserver = ResizeObserver;
globalThis.CSS = { ...globalThis.CSS, supports: () => false } as any;
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
