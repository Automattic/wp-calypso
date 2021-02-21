/**
 * Internal dependencies
 */
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

describe( 'getPrimarySiteId()', () => {
	test( 'should return null if there is no current user', () => {
		const siteId = getPrimarySiteId( {
			currentUser: {},
		} );
		expect( siteId ).toBeNull();
	} );

	test( "should return current user's primary site's ID", () => {
		const siteId = getPrimarySiteId( {
			currentUser: {
				id: 12345678,
				user: { primary_blog: 7654321 },
			},
		} );
		expect( siteId ).toBe( 7654321 );
	} );
} );
