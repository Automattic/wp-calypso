var assert = require( 'chai' ).assert,
	sinon = require( 'sinon' ),
	rewire = require( 'rewire' );

var ThemeConstants = require( 'lib/themes/constants' );

describe( 'ThemesListStore', function() {
	var ThemesListStore, registeredCallback,
		actionReceiveThemes = {
			action: {
				type: ThemeConstants.RECEIVE_THEMES,
				queryParams: {
					id: 1
				},
				themes: [
					{ id: 'bold-news', name: 'Bold News' },
					{ id: 'picard', name: 'Picard' },
					{ id: 'picard', name: 'Picard' }
				]
		},
	},
	actionReceiveMoreThemes = {
		action: {
			type: ThemeConstants.RECEIVE_THEMES,
			queryParams: {
				id: 1
			},
			themes: [
				{ id: 'picard', name: 'Picard' },
				{ id: 'hue', name: 'Hue' }
			]
		}
	},
	actionReceiveEvenMoreThemes = {
		action: {
			type: ThemeConstants.RECEIVE_THEMES,
			queryParams: {
				id: 2
			},
			themes: [
				{ id: '2014', name: 'Twenty Fourteen' },
				{ id: 'cheese', name: 'Cheese' }
			]
		}
	},
	actionQueryThemes = {
		action: {
			type: ThemeConstants.QUERY_THEMES,
			params: {
				search: 'picard',
				perPage: 50,
				page: 25
			}
		}
	},
	actionQueryAnotherTheme = {
		action: {
			type: ThemeConstants.QUERY_THEMES,
			params: {
				search: 'worf',
				perPage: 50,
				page: 25
			}
		}
	},
	actionIncrementPage = {
		action: {
			type: ThemeConstants.INCREMENT_THEMES_PAGE
		}
	};

	beforeEach( function() {
		ThemesListStore = rewire( 'lib/themes/themes-list-store' );
		registeredCallback = ThemesListStore.__get__( 'registeredCallback' );
		ThemesListStore.__set__( 'Dispatcher', { waitFor: sinon.stub() } );
	} );

	describe( 'get()', function() {
		beforeEach( function() {
			registeredCallback( actionQueryThemes );
			registeredCallback( actionReceiveThemes );
		} );

		it( 'returns all themes', function() {
			var themes = ThemesListStore.get();

			assert( themes.length === 2, 'Wrong number of themes' );
		} );
	} );

	describe( 'query()', function() {
		beforeEach( function() {
			registeredCallback( actionQueryThemes );
		} );

		it( 'sets the query paramaters', function() {
			var params = ThemesListStore.getQueryParams();

			assert( params.search === 'picard', 'Wrong param' );
			assert( params.perPage === 50, 'Wrong param' );
			assert( params.page === 25, 'Wrong param' );
		} );
	} );

	describe( 'getQueryParams()', function() {
		context( 'when THEMES_INCREMENT_PAGE is received', function() {
			beforeEach( function() {
				registeredCallback( actionIncrementPage );
			} );

			it( 'increments the page number', function() {
				var params = ThemesListStore.getQueryParams();

				assert( params.page === 1 );
			} );
		} );
	} );

	context( 'when THEMES_RECEIVE is received', function() {
		beforeEach( function() {
			registeredCallback( actionQueryThemes );
			registeredCallback( actionReceiveThemes );
		} );

		it( 'removes duplicates', function() {
			registeredCallback( actionReceiveMoreThemes );

			assert( ThemesListStore.get().length === 3, 'incorrect number of themes' );
		} );
	} );

	context( 'when two THEMES_RECEIVE are received out of order', () => {
		beforeEach( () => {
			registeredCallback( actionQueryThemes ); // first query, query ID of 1
			registeredCallback( actionQueryAnotherTheme ); // second query, ID 2
			registeredCallback( actionReceiveEvenMoreThemes ); // receive themes from second query (ID 2)
			registeredCallback( actionReceiveThemes ); // receive themes from first query (ID 1)
		} );

		it( 'only takes into account the last query results', () => {
			assert( ThemesListStore.get().length === 2 );
			assert( ThemesListStore.get()[0] === '2014' );
		} );
	} );

	context( 'when on a Jetpack site', function() {
		context( 'when THEMES_RECEIVE is received', function() {
			let rewireRevert;

			beforeEach( function() {
				rewireRevert = ThemesListStore.__set__( {
					ThemesLastQueryStore: {
						isJetpack: () => true,
						getParams: () => ( { search: 'picard' } ),
					},
					ThemesStore: {
						get: () => actionReceiveMoreThemes.action.themes,
					}
				} );
			} );

			it( 'filters available themes according to search', function() {
				registeredCallback( actionReceiveMoreThemes );
				assert.equal( ThemesListStore.get().length, 1 );
				assert.equal( ThemesListStore.get()[0], 'picard' );
			} );

			afterEach( function() {
				rewireRevert();
			} );
		} );
	} );
} );
