var assert = require( 'chai' ).assert,
		rewire = require( 'rewire' );

var ThemeConstants = require( 'lib/themes/constants' );

describe( 'ThemesStore', function() {
	var ThemesStore, registeredCallback,
		actionReceiveThemes = {
			action: {
				type: ThemeConstants.RECEIVE_THEMES,
				themes: [
					{ id: 'bold-news', active: true },
					{ id: 'picard' }
				]
			},
		},
		actionReceiveMoreThemes = {
			action: {
				type: ThemeConstants.RECEIVE_THEMES,
				themes: [
					{ id: 'picard' },
					{ id: 'hue' }
				]
			}
		},
		actionThemeActivated = {
			action: {
				type: ThemeConstants.ACTIVATED_THEME,
				theme: { id: 'picard' }
			}
		};

	beforeEach( function() {
		ThemesStore = rewire( 'lib/themes/themes-store' );
		registeredCallback = ThemesStore.__get__( 'registeredCallback' );
	} );

	describe( 'get()', function() {
		beforeEach( function() {
			registeredCallback( actionReceiveThemes );
		} );

		it( 'returns all themes', function() {
			var themes = ThemesStore.get();

			assert( Object.keys( themes ).length === 2, 'Wrong number of themes' );
		} );
	} );

	context( 'when THEMES_RECEIVE is received', function() {
		beforeEach( function() {
			registeredCallback( actionReceiveThemes );
		} );

		it( 'removes duplicates', function() {
			registeredCallback( actionReceiveMoreThemes );

			assert( Object.keys( ThemesStore.get() ).length === 3, 'duplicates found' );
		} );
	} );

	context( 'when ACTIVATED_THEME is received', function() {
		beforeEach( function() {
			registeredCallback( actionReceiveThemes );
		} );

		it( 'clears previous active flag', function() {
			assert.ok( ThemesStore.getById( 'bold-news' ).active, 'initial theme not active' );
			registeredCallback( actionThemeActivated );
			assert.notOk( ThemesStore.getById( 'bold-news' ).active, 'initial theme still active' );
			assert.ok( ThemesStore.getById( 'picard' ).active, 'new theme not active' );
		} );
	} );
} );
