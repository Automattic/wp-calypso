/**
 * Internal dependencies
 */
import getSiteEmbeds from 'state/selectors/get-site-embeds';

describe( 'getSiteEmbeds()', () => {
	const siteId = 12345678;
	const embeds = [ 'foo', 'bar' ];
	const state = {
		embeds: {
			siteItems: {
				[ siteId ]: embeds,
			},
		},
	};

	test( 'should return null if the site is unknown', () => {
		expect( getSiteEmbeds( state, 123 ) ).toBeNull();
	} );

	test( 'should return the embed if it exists for that site and URL', () => {
		expect( getSiteEmbeds( state, siteId ) ).toEqual( embeds );
	} );
} );
