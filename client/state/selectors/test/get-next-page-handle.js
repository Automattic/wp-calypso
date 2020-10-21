/**
 * Internal dependencies
 */
import getNextPageHandle from 'calypso/state/selectors/get-next-page-handle';

describe( 'getNextPageHandle', () => {
	const siteId = 23478323;
	const nextPageHandle = Symbol( 'nextPageHandle' );
	it( 'should retrieve the next page handle for the site', () => {
		expect(
			getNextPageHandle( { media: { fetching: { [ siteId ]: { nextPageHandle } } } }, siteId )
		).toEqual( nextPageHandle );
	} );

	it( 'should return undefined when the handle does not exist', () => {
		expect( getNextPageHandle( { media: { fetching: {} } }, siteId ) ).toBeUndefined();
	} );
} );
