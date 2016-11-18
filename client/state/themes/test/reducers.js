/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	activeThemes,
	activeThemeRequest,
} from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( '#activeThemes()', () => {
		it( 'should default to an empty object', () => {
			const state = activeThemes( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track active theme request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				themeId: 'rebalance',
				themeName: 'Rebalance',
				themeCost: {
					currency: 'USD',
					number: 0,
					display: ''
				}
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.eql( { 2211667: 'rebalance' } );
		} );

		it( 'should track active theme request success and overwrite old theme', () => {
			let state = activeThemes( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				themeId: 'rebalance',
				themeName: 'Rebalance',
				themeCost: {
					currency: 'USD',
					number: 0,
					display: ''
				}
			} );

			state = activeThemes( deepFreeze( state ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				themeId: 'twentysixteen',
				themeName: 'Twentysixteen',
				themeCost: {
					currency: 'USD',
					number: 0,
					display: ''
				}
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.eql( { 2211667: 'twentysixteen' } );
		} );

		it( 'should track theme activate request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				meta: {
					analytics: [
						{
							payload: {
								name: 'calypso_themeshowcase_theme_activate',
								properties: {
									previous_theme: 'twentyfifteen',
									purchased: false,
									search_term: 'simple, white',
									source: 'unknown',
									theme: 'twentysixteen',
								},
								service: 'tracks',
							},
							type: 'ANALYTICS_EVENT_RECORD'
						},
					],
				},
				type: THEME_ACTIVATE_REQUEST_SUCCESS,
				theme: { id: 'twentysixteen' },
				siteId: 2211888,
			} );

			expect( state ).to.have.keys( [ '2211888' ] );
			expect( state ).to.eql( { 2211888: 'twentysixteen' } );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( activeThemes( deepFreeze( {} ), {
				meta: {
					analytics: [
						{
							payload: {
								name: 'calypso_themeshowcase_theme_activate',
								properties: {
									previous_theme: 'twentyfifteen',
									purchased: false,
									search_term: 'simple, white',
									source: 'unknown',
									theme: 'twentysixteen',
								},
								service: 'tracks',
							},
							type: 'ANALYTICS_EVENT_RECORD'
						},
					],
				},
				type: THEME_ACTIVATE_REQUEST_SUCCESS,
				theme: { id: 'twentysixteen' },
				siteId: 2211888,
			} ) );

			const state = activeThemes( original, { type: SERIALIZE } );

			expect( state ).to.eql( { 2211888: 'twentysixteen' } );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( { 2211888: 'twentysixteen' } );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).to.eql( { 2211888: 'twentysixteen' } );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: 1234
			} );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'activeThemeRequest', () => {
		it( 'should default to an empty object', () => {
			const state = activeThemeRequest( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should map site ID to true value if request in progress', () => {
			const state = activeThemeRequest( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = activeThemeRequest( deepFreeze( {
				2916284: true
			} ),
				{
					type: ACTIVE_THEME_REQUEST,
					siteId: 2916285,
				} );

			expect( state ).to.eql( {
				2916284: true,
				2916285: true,
			} );
		} );

		it( 'should map site ID to false value if request finishes successfully', () => {
			const state = activeThemeRequest( deepFreeze( {
				2916284: true
			} ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2916284,
				themeId: 'twentysixteen',
				themeName: 'Twentysixteen',
				themeCost: {
					currency: 'USD',
					number: 0,
					display: ''
				}
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'should map site ID to false value if request finishes with failure', () => {
			const state = activeThemeRequest( deepFreeze( {
				2916284: true
			} ), {
				type: ACTIVE_THEME_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'Unknown blog',
			} );

			expect( state ).to.eql( {
				2916284: false
			} );
		} );

		it( 'never persists state', () => {
			const state = activeThemeRequest( deepFreeze( {
				2916284: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = activeThemeRequest( deepFreeze( {
				2916284: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
