import deepFreeze from 'deep-freeze';
import { getPluginsForSite, hasRequested } from '../selectors';
import { initSite } from './examples';

const state = deepFreeze( {
	plugins: {
		premium: {
			hasRequested: {
				'finished.site': true,
				'wait.site': false,
			},
			plugins: {
				'start.site': initSite,
			},
		},
	},
} );

describe( 'Premium Plugin Selectors', () => {
	describe( 'hasRequested', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( hasRequested( state, 'no.site' ) ).toBe( false );
		} );

		test( 'Should get `false` if the requested site has not been fetched', () => {
			expect( hasRequested( state, 'wait.site' ) ).toBe( false );
		} );

		test( 'Should get `true` if the requested site has been fetched', () => {
			expect( hasRequested( state, 'finished.site' ) ).toBe( true );
		} );
	} );

	describe( 'getPluginsForSite', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect( getPluginsForSite( state, 'no.site' ) ).toEqual( [] );
		} );

		test( 'Should get the list of plugins if the site exists in the current state', () => {
			expect( getPluginsForSite( state, 'start.site' ) ).toHaveLength( 3 );
			expect( getPluginsForSite( state, 'start.site' )[ 0 ].slug ).toBe( 'vaultpress' );
			expect( getPluginsForSite( state, 'start.site' )[ 1 ].slug ).toBe( 'akismet' );
			expect( getPluginsForSite( state, 'start.site' )[ 2 ].slug ).toBe( 'polldaddy' );
		} );
	} );
} );
