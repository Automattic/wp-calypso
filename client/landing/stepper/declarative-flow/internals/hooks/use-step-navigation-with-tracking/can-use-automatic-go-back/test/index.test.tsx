/**
 * @jest-environment jsdom
 */
import { canUseAutomaticGoBack } from '..';

describe( 'canUseAutomaticGoBack', () => {
	const originalLocation = window.location;
	const originalDocument = document;

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, host: 'example.com' },
			writable: true,
			configurable: true,
		} );
		Object.defineProperty( document, 'referrer', {
			value: 'https://example.com',
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
		} );
		Object.defineProperty( document, 'referrer', {
			value: originalDocument,
		} );
	} );

	it( 'returns true when the referrer is the same domain', () => {
		expect( canUseAutomaticGoBack() ).toBe( true );
	} );

	it( 'returns false when the referrer is not the same domain', () => {
		window.location.host = 'domain.com';
		( window.document as any ).referrer = 'https://another-domain.com';

		expect( canUseAutomaticGoBack() ).toBe( false );
	} );
} );
