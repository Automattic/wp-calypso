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
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_REQUEST,
	THEMES_REQUEST_FAILURE,
	THEMES_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	queryRequests,
	queries,
	themeRequests,
	activeThemes,
	activeThemeRequest,
} from '../reducer';
import ThemeQueryManager from 'lib/query-manager/theme';

const twentysixteen = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/'
};

const mood = {
	id: 'mood',
	name: 'Mood',
	author: 'Automattic',
	screenshot: 'mood.jpg',
	price: '$20',
	stylesheet: 'premium/mood',
	demo_uri: 'https://mooddemo.wordpress.com/',
	author_uri: 'https://wordpress.com/themes/'
};

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			// Old reducers
			'themes',
			'themeDetails',
			'themesList',
			// New reducers
			//'queries',
			//'queryRequests',
			//'themeRequests',
			'currentTheme',
			'themesUI'
		] );
	} );

	describe( '#queryRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		// TODO: Delete test? no site-specific search?
		it( 'should track theme query request fetching', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': true
			} );
		} );

		it( 'should track theme queries without specified site', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				'{"search":"Hello"}': true
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true
			} );

			const state = queryRequests( original, {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' }
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': true,
				'2916284:{"search":"Hello W"}': true
			} );
		} );

		it( 'should track theme query request success', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Mood' },
				found: 1,
				themes: [
					mood
				]
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Mood"}': false
			} );
		} );

		it( 'should track theme query request failure', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error()
			} );

			expect( state ).to.eql( {
				'2916284:{"search":"Hello"}': false
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true
			} );

			const state = queryRequests( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true
			} );

			const state = queryRequests( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#queries()', () => {
		it( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track theme query request success', () => {
			const state = queries( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Mood' },
				found: 1,
				themes: [ mood ]
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( ThemeQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Mood' } ) ).to.eql( [ mood ] );
		} );

		it( 'should accumulate query request success', () => {
			const original = deepFreeze( queries( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' },
				found: 1,
				themes: [ twentysixteen ]
			} ) );

			const state = queries( original, {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty Six' },
				themes: [ twentysixteen ]
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( ThemeQueryManager );
			expect( state[ 2916284 ].getItems( { search: 'Twenty' } ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( { search: 'Twenty Six' } ) ).to.have.length( 1 );
		} );

		it( 'should return the same state if successful request has no changes', () => {
			const action = {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' },
				found: 1,
				themes: [ twentysixteen ]
			};
			const original = deepFreeze( queries( deepFreeze( {} ), action ) );
			const state = queries( original, action );

			expect( state ).to.equal( original );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( queries( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Sixteen' },
				found: 1,
				themes: [
					twentysixteen
				]
			} ) );

			const state = queries( original, { type: SERIALIZE } );

			expect( state ).to.eql( {
				2916284: {
					data: {
						items: {
							twentysixteen
						},
						queries: {
							'[["search","Sixteen"]]': {
								itemKeys: [ 'twentysixteen' ],
								found: 1
							}
						}
					},
					options: {
						itemKey: 'id'
					}
				}
			} );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					data: {
						items: {
							twentysixteen
						},
						queries: {
							'[["search","Sixteen"]]': {
								itemKeys: [ 'twentysixteen' ],
								found: 1
							}
						}
					},
					options: {
						itemKey: 'id'
					}
				}
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {
				2916284: new ThemeQueryManager( {
					items: {
						twentysixteen
					},
					queries: {
						'[["search","Sixteen"]]': {
							found: 1,
							itemKeys: [ 'twentysixteen' ]
						}
					}
				}, { itemKey: 'id' } )
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: '{INVALID'
			} );

			const state = queries( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#themeRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = themeRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map site ID, theme ID to true value if request in progress', () => {
			const state = themeRequests( deepFreeze( {} ), {
				type: THEME_REQUEST,
				siteId: 2916284,
				themeId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: true
				}
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: THEME_REQUEST,
				siteId: 2916284,
				themeId: 413
			} );

			expect( state ).to.eql( {
				2916284: {
					841: true,
					413: true
				}
			} );
		} );

		it( 'should map site ID, theme ID to false value if request finishes successfully', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: THEME_REQUEST_SUCCESS,
				siteId: 2916284,
				themeId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: false
				}
			} );
		} );

		it( 'should map site ID, theme ID to false value if request finishes with failure', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: THEME_REQUEST_FAILURE,
				siteId: 2916284,
				themeId: 841
			} );

			expect( state ).to.eql( {
				2916284: {
					841: false
				}
			} );
		} );

		it( 'never persists state', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
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
