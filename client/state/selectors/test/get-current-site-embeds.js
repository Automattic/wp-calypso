/**
 * Internal dependencies
 */
import getCurrentSiteEmbeds from 'state/selectors/get-current-site-embeds';

describe( 'getCurrentSiteEmbeds()', () => {
	const siteId = 12345678;
	const embeds = [ 'foo', 'bar' ];
	const initialState = {
		embeds: {
			siteItems: {
				[ siteId ]: embeds,
			},
		},
		ui: {
			selectedSiteId: siteId,
		},
	};

	test( 'should return null if the selected site is unknown', () => {
		const state = {
			...initialState,
			ui: {
				selectedSiteId: 87654321,
			},
		};
		expect( getCurrentSiteEmbeds( state ) ).toBeNull();
	} );

	test( 'should return the embed if it exists for that site and URL', () => {
		expect( getCurrentSiteEmbeds( initialState, siteId ) ).toEqual( embeds );
	} );
} );
