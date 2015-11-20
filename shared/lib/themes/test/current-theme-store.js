require( 'lib/react-test-env-setup' )();

var expect = require( 'chai' ).expect,
	rewire = require( 'rewire' );

var ThemeConstants = require( 'lib/themes/constants' );

describe( 'CurrentThemeStore', function() {
	var SITE = { ID: 77203074 }; // dummy id

	var CurrentThemeStore, registeredCallback,
		actionReceiveCurrentTheme = {
			action: {
				type: ThemeConstants.RECEIVE_CURRENT_THEME,
				themeId: 'twentyfifteen',
				themeName: 'Twenty Fifteen',
				site: SITE
			}
		};

	beforeEach( function() {
		CurrentThemeStore = rewire( 'lib/themes/current-theme-store' );
		registeredCallback = CurrentThemeStore.__get__( 'registeredCallback' );
	} );

	describe( 'get()', function() {
		beforeEach( function() {
			registeredCallback( actionReceiveCurrentTheme );
		} );

		it( 'returns the current theme for the supplied site id', function() {
			var currentTheme = CurrentThemeStore.getCurrentTheme( SITE.ID );

			expect( currentTheme.id ).to.equal( 'twentyfifteen' );
			expect( currentTheme.name ).to.equal( 'Twenty Fifteen' );
		} );
	} );
} );
