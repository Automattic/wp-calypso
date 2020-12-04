/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

describe( 'getPrimarySiteId()', () => {
	test( 'should return null if there is no current user', () => {
		const siteId = getPrimarySiteId( {
			currentUser: {},
		} );
		expect( siteId ).to.be.null;
	} );

	test( "should return current user's primary site's ID", () => {
		const siteId = getPrimarySiteId( {
			currentUser: {
				id: 12345678,
			},
			users: {
				items: {
					12345678: {
						primary_blog: 7654321,
					},
				},
			},
		} );
		expect( siteId ).to.equal( 7654321 );
	} );
} );
