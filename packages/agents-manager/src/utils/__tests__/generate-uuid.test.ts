import { generateUUID } from '../generate-uuid';

describe( 'generateUUID', () => {
	const savedRandomUUID = globalThis.crypto.randomUUID;
	const savedGetRandomValues = globalThis.crypto.getRandomValues;

	afterEach( () => {
		globalThis.crypto.randomUUID = savedRandomUUID;
		globalThis.crypto.getRandomValues = savedGetRandomValues;
		jest.restoreAllMocks();
	} );

	it( 'uses crypto.randomUUID when available', () => {
		const randomUUIDSpy = jest
			.spyOn( globalThis.crypto, 'randomUUID' )
			.mockReturnValue( 'crypto-uuid' as ReturnType< Crypto[ 'randomUUID' ] > );

		expect( generateUUID() ).toBe( 'crypto-uuid' );
		expect( randomUUIDSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back when crypto.randomUUID is unavailable', () => {
		// @ts-expect-error - Simulating an older browser.
		delete globalThis.crypto.randomUUID;

		expect( generateUUID() ).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
		);
	} );

	it( 'uses crypto.getRandomValues for fallback randomness', () => {
		// @ts-expect-error - Simulating an older browser.
		delete globalThis.crypto.randomUUID;
		const getRandomValuesSpy = jest.spyOn( globalThis.crypto, 'getRandomValues' );

		generateUUID();

		expect( getRandomValuesSpy ).toHaveBeenCalled();
	} );

	it( 'never falls back to Math.random', () => {
		// @ts-expect-error - Simulating a browser without Web Crypto.
		delete globalThis.crypto.randomUUID;
		// @ts-expect-error - Simulating a browser without Web Crypto.
		globalThis.crypto.getRandomValues = undefined;
		const mathRandomSpy = jest.spyOn( Math, 'random' );

		expect( () => generateUUID() ).toThrow();
		expect( mathRandomSpy ).not.toHaveBeenCalled();
	} );

	it( 'keeps fallback UUIDs valid when getRandomValues returns the maximum byte', () => {
		// @ts-expect-error - Simulating an older browser.
		delete globalThis.crypto.randomUUID;
		jest.spyOn( globalThis.crypto, 'getRandomValues' ).mockImplementation( ( array ) => {
			if ( array ) {
				new Uint8Array( array.buffer, array.byteOffset, array.byteLength ).fill( 255 );
			}
			return array;
		} );

		expect( generateUUID() ).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
		);
	} );
} );
