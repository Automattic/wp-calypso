/**
 * Internal dependencies
 */
import isSavingWordadsSettings from 'calypso/state/selectors/is-saving-wordads-settings';

describe( 'isSavingWordadsSettings()', () => {
	const siteId = 12345678;
	const state = {
		wordads: {
			settings: {
				requests: {
					[ siteId ]: true,
				},
			},
		},
	};

	test( 'should return false for an unknown site', () => {
		const output = isSavingWordadsSettings( state, 87654321 );
		expect( output ).toBe( false );
	} );

	test( 'should return the request state for a known site', () => {
		const output = isSavingWordadsSettings( state, siteId );
		expect( output ).toBe( true );
	} );
} );
