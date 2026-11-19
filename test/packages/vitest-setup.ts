import '../../build-tools/vite/test-setup/setup-globals';
import nock from 'nock';
import { afterAll, vi } from 'vitest';

// jsdom's `crypto` lacks `randomUUID`, which Node's `crypto` provided outside the vm pools.
if ( globalThis.crypto && typeof globalThis.crypto.randomUUID !== 'function' ) {
	const { webcrypto } = await import( 'node:crypto' );
	Object.defineProperty( globalThis.crypto, 'randomUUID', {
		value: () => webcrypto.randomUUID(),
		configurable: true,
		writable: true,
	} );
}

if ( ! nock.isActive() ) {
	nock.activate();
}

// Node's `http` outlives each file's vm context under `vmForks`, so unpatch it when the file ends.
// Some files leave fake timers on, which would stop the wait below from ever ending.
afterAll( async () => {
	vi.useRealTimers();
	await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	nock.abortPendingRequests();
	nock.restore();
} );
