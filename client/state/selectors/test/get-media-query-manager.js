/**
 * Internal dependencies
 */
import getMediaQueryManager from 'calypso/state/selectors/get-media-query-manager';

describe( 'getMediaQueryManager', () => {
	const siteId = 23478323;
	const queryManager = Symbol( 'MediaQueryManager' );
	it( 'should retrieve the media query manager for the site', () => {
		expect(
			getMediaQueryManager( { media: { queries: { [ siteId ]: queryManager } } }, siteId )
		).toEqual( queryManager );
	} );

	it( 'should return null when the query does not exist', () => {
		expect( getMediaQueryManager( { media: { queries: {} } }, siteId ) ).toBeNull();
	} );
} );
