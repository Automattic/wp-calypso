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
	THEME_ACTIVATE,
	THEME_ACTIVATE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
	THEME_CLEAR_ACTIVATED,
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	queryRequests,
	queryRequestErrors,
	queries,
	lastQuery,
	themeRequests,
	themeRequestErrors,
	activeThemes,
	activationRequests,
	activeThemeRequests,
	themeInstalls,
	completedActivationRequests,
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
			'queries',
			'queryRequests',
			'queryRequestErrors',
			'lastQuery',
			'themeInstalls',
			'themeRequests',
			'themeRequestErrors',
			'activeThemes',
			'activeThemeRequests',
			'activationRequests',
			'completedActivationRequests',
			'themesUI',
			'uploadTheme',
			'themePreviewOptions',
			'themePreviewVisibility',
			'themeFilters',
		] );
	} );

	describe( '#queryRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		// TODO: Delete test? no site-specific search?
		it( 'should track theme query request fetching', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.deep.equal( {
				'2916284:{"search":"Hello"}': true
			} );
		} );

		it( 'should track theme queries without specified site', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: THEMES_REQUEST,
				query: { search: 'Hello' }
			} );

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
				'2916284:{"search":"Hello"}': false
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true
			} );

			const state = queryRequests( original, { type: SERIALIZE } );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				'2916284:{"search":"Hello"}': true
			} );

			const state = queryRequests( original, { type: DESERIALIZE } );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#queryRequestErrors()', () => {
		it( 'should default to an empty object', () => {
			const state = queryRequestErrors( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should create empty mapping on success if previous state was empty', () => {
			const state = queryRequestErrors( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' }
			} );

			expect( state ).to.deep.equal( {
				2916284: {}
			} );
		} );

		it( 'should map site ID, query to error if request finishes with failure', () => {
			const state = queryRequestErrors( deepFreeze( {} ), {
				type: THEMES_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Twenty' },
				error: 'Request error'
			} );

			expect( state ).to.deep.equal( {
				2916284: {
					'2916284:{"search":"Twenty"}': 'Request error'
				}
			} );
		} );

		it( 'should reset error state after successful request after a failure', () => {
			const state = queryRequestErrors( deepFreeze( {
				2916284: {
					'2916284:{"search":"Twenty"}': 'Request Error'
				}
			} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Twenty' }
			} );

			expect( state ).to.deep.equal( {
				2916284: {}
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = queryRequestErrors( deepFreeze( {
				2916284: {
					'2916284:{"blerch":"Twenty"}': 'Invalid query!'
				}
			} ), {
				type: THEMES_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Twenty' },
				error: 'System error'
			} );

			expect( state ).to.deep.equal( {
				2916284: {
					'2916284:{"blerch":"Twenty"}': 'Invalid query!',
					'2916284:{"search":"Twenty"}': 'System error'
				}
			} );
		} );

		it( 'never persists state', () => {
			const state = queryRequestErrors( deepFreeze( {
				2916284: {
					'2916284:{"search":"Twenty"}': null
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = queryRequestErrors( deepFreeze( {
				2916284: {
					'2916284:{"search":"Twenty"}': null
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#queries()', () => {
		it( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.deep.equal( {} );
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
			expect( state[ 2916284 ].getItems( { search: 'Mood' } ) ).to.deep.equal( [ mood ] );
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#lastQuery()', () => {
		it( 'should default to an empty object', () => {
			const state = lastQuery( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should store last query', () => {
			const state = lastQuery( deepFreeze( {} ), {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Sixteen' },
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state ).to.deep.equal( {
				2916284: {
					search: 'Sixteen'
				}
			} );
		} );

		it( 'should overwrite last query with new query', () => {
			const state = lastQuery(
				deepFreeze( {
					2916284: {
						search: 'Sixteen'
					}
				} ),
				{
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'orange color' },
				}
			);

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state ).to.deep.equal( {
				2916284: {
					search: 'orange color'
				}
			} );
		} );
	} );

	describe( '#themeRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = themeRequests( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should map site ID, theme ID to true value if request in progress', () => {
			const state = themeRequests( deepFreeze( {} ), {
				type: THEME_REQUEST,
				siteId: 2916284,
				themeId: 841
			} );

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {
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

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = themeRequests( deepFreeze( {
				2916284: {
					841: true
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#themeRequestErrors()', () => {
		const themeError = deepFreeze( {
			wpcom: {
				blah: {
					path: '\rest\v1.2\themes\blah',
					method: 'GET',
					name: 'ThemeNotFoundError',
					statusCode: 404,
					status: 404,
					message: 'The specified theme was not found',
					error: 'theme_not_found',
				}
			}
		} );

		it( 'should default to an empty object', () => {
			const state = themeRequestErrors( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should create empyt mapping on success if previous state was empty', () => {
			const state = themeRequestErrors( deepFreeze( {} ), {
				type: THEME_REQUEST_SUCCESS,
				siteId: 2916284,
				themeId: 'twentysixteen'
			} );

			expect( state ).to.deep.equal( {
				2916284: {}
			} );
		} );

		it( 'should map site ID, theme ID to error if request finishes with failure', () => {
			const state = themeRequestErrors( deepFreeze( {} ), {
				type: THEME_REQUEST_FAILURE,
				siteId: 2916284,
				themeId: 'vivaro',
				error: 'Request error'
			} );

			expect( state ).to.deep.equal( {
				2916284: {
					vivaro: 'Request error'
				}
			} );
		} );

		it( 'should switch from error to no mapping after successful request after a failure', () => {
			const state = themeRequestErrors( deepFreeze( {
				2916284: {
					pinboard: 'Request Error'
				}
			} ), {
				type: THEME_REQUEST_SUCCESS,
				siteId: 2916284,
				themeId: 'pinboard'
			} );

			expect( state ).to.deep.equal( {
				2916284: {}
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = themeRequestErrors( deepFreeze( {
				2916284: {
					twentysixteennnnn: 'No such theme!'
				}
			} ), {
				type: THEME_REQUEST_FAILURE,
				siteId: 2916284,
				themeId: 'twentysixteen',
				error: 'System error'
			} );

			expect( state ).to.deep.equal( {
				2916284: {
					twentysixteennnnn: 'No such theme!',
					twentysixteen: 'System error'
				}
			} );
		} );

		it( 'persists state', () => {
			const state = themeRequestErrors( themeError, {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( themeError );
		} );

		it( 'loads persisted state', () => {
			const state = themeRequestErrors( themeError, {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( themeError );
		} );
	} );

	describe( '#activeThemes()', () => {
		it( 'should default to an empty object', () => {
			const state = activeThemes( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should track active theme request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				theme: {
					id: 'rebalance',
					name: 'Rebalance',
					cost: {
						currency: 'USD',
						number: 0,
						display: ''
					}
				}
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.deep.equal( { 2211667: 'rebalance' } );
		} );

		it( 'should track active theme request success and overwrite old theme', () => {
			const state = activeThemes( deepFreeze( { 2211667: 'rebalance' } ), {
				type: ACTIVE_THEME_REQUEST_SUCCESS,
				siteId: 2211667,
				theme: {
					id: 'twentysixteen',
					name: 'Twenty Sixteen',
					cost: {
						currency: 'USD',
						number: 0,
						display: ''
					}
				}
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.deep.equal( { 2211667: 'twentysixteen' } );
		} );

		it( 'should track theme activate request success', () => {
			const state = activeThemes( deepFreeze( {} ), {
				type: THEME_ACTIVATE_SUCCESS,
				themeStylesheet: 'twentysixteen',
				siteId: 2211888,
			} );

			expect( state ).to.have.keys( [ '2211888' ] );
			expect( state ).to.deep.equal( { 2211888: 'twentysixteen' } );
		} );

		it( 'should persist state', () => {
			const state = activeThemes( { 2211888: 'twentysixteen' }, { type: SERIALIZE } );

			expect( state ).to.deep.equal( { 2211888: 'twentysixteen' } );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2211888: 'twentysixteen'
			} );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).to.deep.equal( { 2211888: 'twentysixteen' } );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: 1234
			} );

			const state = activeThemes( original, { type: DESERIALIZE } );
			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#activationRequests', () => {
		it( 'should default to an empty object', () => {
			const state = activationRequests( undefined, {} );
			expect( state ).to.deep.equal( {} );
		} );

		it( 'should map site ID to true value if request in progress', () => {
			const state = activationRequests( deepFreeze( {} ), {
				type: THEME_ACTIVATE,
				siteId: 2916284,
			} );

			expect( state ).to.deep.equal( {
				2916284: true
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = activationRequests(
				deepFreeze( {
					2916284: true
				} ),
				{
					type: THEME_ACTIVATE,
					siteId: 2916285,
				}
			);

			expect( state ).to.deep.equal( {
				2916284: true,
				2916285: true,
			} );
		} );

		it( 'should map site ID to false value if request finishes successfully', () => {
			const state = activationRequests(
				deepFreeze( {
					2916284: true
				} ),
				{
					type: THEME_ACTIVATE_SUCCESS,
					siteId: 2916284,
					themeStylesheet: 'twentysixteen',
				}
			);

			expect( state ).to.deep.equal( {
				2916284: false
			} );
		} );

		it( 'should map site ID to false value if request finishes with failure', () => {
			const state = activationRequests( deepFreeze( {
				2916284: true
			} ), {
				type: THEME_ACTIVATE_FAILURE,
				siteId: 2916284,
				themeId: 'twentysixteen',
				error: 'Unknown blog',
			} );

			expect( state ).to.deep.equal( {
				2916284: false
			} );
		} );

		it( 'never persists state', () => {
			const state = activationRequests( deepFreeze( {
				2916284: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = activationRequests( deepFreeze( {
				2916284: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#themeInstalls()', () => {
		it( 'should default to an empty object', () => {
			const state = themeInstalls( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should map site ID, theme ID to true value if request in progress', () => {
			const state = themeInstalls( deepFreeze( {} ), {
				type: THEME_INSTALL,
				siteId: 2211667,
				themeId: 'karuna'
			} );

			expect( state ).to.deep.equal( {
				2211667: {
					karuna: true
				}
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = themeInstalls( deepFreeze( {
				2211667: {
					karuna: true
				}
			} ), {
				type: THEME_INSTALL,
				siteId: 'anothersitewithjetpack.com',
				themeId: 'pinboard'
			} );

			expect( state ).to.deep.equal( {
				2211667: {
					karuna: true
				},
				'anothersitewithjetpack.com': {
					pinboard: true
				}
			} );
		} );

		it( 'should map site ID, theme ID to false value if request finishes successfully', () => {
			const state = themeInstalls( deepFreeze( {
				2211667: {
					karuna: true
				}
			} ), {
				type: THEME_INSTALL_SUCCESS,
				siteId: 2211667,
				themeId: 'karuna'
			} );

			expect( state ).to.deep.equal( {
				2211667: {
					karuna: false
				}
			} );
		} );

		it( 'should map site ID, theme ID to false value if request finishes with failure', () => {
			const state = themeInstalls( deepFreeze( {
				2211667: {
					karuna: true
				}
			} ), {
				type: THEME_INSTALL_FAILURE,
				siteId: 2211667,
				themeId: 'karuna',
				error: { message: 'The theme is already installed' }
			} );

			expect( state ).to.deep.equal( {
				2211667: {
					karuna: false
				}
			} );
		} );

		it( 'never persists state', () => {
			const state = themeInstalls( deepFreeze( {
				2211667: {
					karuna: true
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = themeInstalls( deepFreeze( {
				2211667: {
					karuna: false
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#completedActivationRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = completedActivationRequests( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should track theme activate request success', () => {
			const state = completedActivationRequests( deepFreeze( {} ), {
				type: THEME_ACTIVATE_SUCCESS,
				siteId: 2211667,
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.deep.equal( { 2211667: true } );
		} );

		it( 'should track theme clear activated', () => {
			const state = completedActivationRequests( deepFreeze( { 2211667: true } ), {
				type: THEME_CLEAR_ACTIVATED,
				siteId: 2211667,
			} );

			expect( state ).to.have.keys( [ '2211667' ] );
			expect( state ).to.deep.equal( { 2211667: false } );
		} );

		it( 'never persists state', () => {
			const state = completedActivationRequests( deepFreeze( {
				2916284: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = completedActivationRequests( deepFreeze( {
				2916284: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( '#activeThemeRequests', () => {
		it( 'should default to an empty object', () => {
			const state = activeThemeRequests( undefined, {} );
			expect( state ).to.deep.equal( {} );
		} );

		it( 'should map site ID to true value if request in progress', () => {
			const state = activeThemeRequests( deepFreeze( {} ), {
				type: ACTIVE_THEME_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.deep.equal( {
				2916284: true
			} );
		} );

		it( 'should accumulate mappings', () => {
			const state = activeThemeRequests(
				deepFreeze( {
					2916284: true
				} ),
				{
					type: ACTIVE_THEME_REQUEST,
					siteId: 2916285,
				}
			);

			expect( state ).to.deep.equal( {
				2916284: true,
				2916285: true,
			} );
		} );

		it( 'should map site ID to false value if request finishes successfully', () => {
			const state = activeThemeRequests(
				deepFreeze( {
					2916284: true
				} ),
				{
					type: ACTIVE_THEME_REQUEST_SUCCESS,
					siteId: 2916284,
					themeId: 'twentysixteen',
				}
			);

			expect( state ).to.deep.equal( {
				2916284: false
			} );
		} );

		it( 'should map site ID to false value if request finishes with failure', () => {
			const state = activeThemeRequests( deepFreeze( {
				2916284: true
			} ), {
				type: ACTIVE_THEME_REQUEST_FAILURE,
				siteId: 2916284,
				error: 'Unknown blog',
			} );

			expect( state ).to.deep.equal( {
				2916284: false
			} );
		} );

		it( 'never persists state', () => {
			const state = activeThemeRequests( deepFreeze( {
				2916284: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'never loads persisted state', () => {
			const state = activeThemeRequests( deepFreeze( {
				2916284: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
