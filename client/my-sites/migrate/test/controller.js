/**
 * @jest-environment jsdom
 */
import { redirectToMigrationFlow } from '../controller';

describe( 'redirectToMigrationFlow', () => {
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	let locationReplace;

	beforeEach( () => {
		locationReplace = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { replace: locationReplace },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'passes a source site slug from the URL as the source address, but not a site ID', () => {
		redirectToMigrationFlow( {
			params: { site_id: 'example.com', sourceSiteId: 'source.example::blog' },
			query: {},
		} );
		redirectToMigrationFlow( {
			params: { site_id: 'example.com', sourceSiteId: '123' },
			query: {},
		} );

		expect( locationReplace.mock.calls ).toEqual( [
			[ '/setup/site-migration?siteSlug=example.com&from=source.example%2Fblog' ],
			[ '/setup/site-migration?siteSlug=example.com' ],
		] );
	} );
} );
