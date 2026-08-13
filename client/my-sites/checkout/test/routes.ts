/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import registerCheckoutRoutes from '../index';

jest.mock( '@automattic/calypso-router' );

describe( 'checkout route registration', () => {
	let registeredPaths: string[];

	beforeAll( () => {
		registerCheckoutRoutes();
		registeredPaths = ( page as unknown as jest.Mock ).mock.calls.map( ( call ) => call[ 0 ] );
	} );

	// page.js matches in registration order, so `/checkout/studio-return` would otherwise be
	// swallowed by the generic single-segment route and parsed as a product slug.
	it( 'registers /checkout/studio-return ahead of the generic product route', () => {
		const studioReturnIndex = registeredPaths.indexOf( '/checkout/studio-return' );
		const genericProductIndex = registeredPaths.indexOf( '/checkout/:domainOrProduct' );

		expect( studioReturnIndex ).toBeGreaterThan( -1 );
		expect( genericProductIndex ).toBeGreaterThan( -1 );
		expect( studioReturnIndex ).toBeLessThan( genericProductIndex );
	} );
} );
