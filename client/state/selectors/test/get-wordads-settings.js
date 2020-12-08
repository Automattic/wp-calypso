/**
 * Internal dependencies
 */
import getWordadsSettings from 'calypso/state/selectors/get-wordads-settings';

describe( 'getWordadsSettings()', () => {
	const settings = {
		paypal: 'support@wordpress.com',
		addr1: '123 streetname street',
	};
	const siteId = 12345678;
	const sitesState = {
		sites: {
			items: {
				[ siteId ]: {
					jetpack: false,
				},
			},
		},
	};

	test( 'should return null for an unknown site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						87654321: settings,
					},
				},
			},
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toBeNull();
	} );

	test( 'should return all stored Wordads settings for a known site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: settings,
					},
				},
			},
			...sitesState,
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toMatchObject( settings );
	} );

	test( 'should return a truthy normalized us_checked field when us_resident is "yes"', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: {
							us_resident: 'yes',
						},
					},
				},
			},
			...sitesState,
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toHaveProperty( 'us_checked', true );
	} );

	test( 'should return a falsy normalized us_checked field when us_resident is "no"', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: {
							us_resident: 'no',
						},
					},
				},
			},
			...sitesState,
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toHaveProperty( 'us_checked', false );
	} );

	test( 'should force "yes" for the show_to_logged_in field for a Jetpack site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: {
							show_to_logged_in: 'no',
						},
					},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						jetpack: true,
					},
				},
			},
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toHaveProperty( 'show_to_logged_in', 'yes' );
	} );
} );
