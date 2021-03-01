/**
 * Internal dependencies
 */
import hasNextMediaPage from 'calypso/state/selectors/has-next-media-page';

describe( 'hasNextMediaPage', () => {
	const siteId = 23478323;

	it.each( [ {}, { [ siteId ]: {} } ] )(
		'should be true when the next page handle does not exist; fetching(%s)',
		( fetching ) => {
			expect( hasNextMediaPage( { media: { fetching } }, siteId ) ).toBe( true );
		}
	);

	it.each( [ true, 'the-next-page', 323 ] )(
		'should return true when the next page handle is %s',
		( nextPageHandle ) => {
			expect(
				hasNextMediaPage( { media: { fetching: { [ siteId ]: { nextPageHandle } } } }, siteId )
			).toBe( true );
		}
	);

	it( 'should be false when the next page handle is null', () => {
		expect(
			hasNextMediaPage( { media: { fetching: { [ siteId ]: { nextPageHandle: null } } } }, siteId )
		).toBe( false );
	} );
} );
