/**
 * External dependencies
 */
var page = require( 'page' ),
	defer = require( 'lodash/function/defer' ),
	debug = require( 'debug' )( 'calypso:themes:actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	analytics = require( 'analytics' ),
	ThemesStore = require( './stores/themes' ),
	ThemesListStore = require( './stores/themes-list' ),
	ThemeConstants = require( './constants' ),
	ThemeHelpers = require( './helpers' ),
	CurrentThemeStore = require( './stores/current-theme' ),
	LastEventStore = require( './stores/themes-last-event' ),
	ThemeConstants = require( './constants' ),
	ThemesLastQueryStore = require( './stores/themes-last-query' );

var ThemesActions = {
	fetch: function( site ) {
		const queryParams = ThemesListStore.getQueryParams();
		const startTime = new Date().getTime();
		const callback = function( error, data ) {
			debug( 'Received themes data', data );
			if ( error ) {
				this.receiveServerError( error );
			} else {
				const responseTime = ( new Date().getTime() ) - startTime;
				this.receiveThemes( data, site, queryParams, responseTime );
			}
		}.bind( this );

		debug( 'Query params', queryParams );
		wpcom.undocumented().themes( site, queryParams, callback );
	},

	fetchJetpack: function( site ) {
		if ( hasSiteChanged() ) {
			return this.fetch( site );
		}

		Dispatcher.handleViewAction( {
			type: ThemeConstants.SEARCH_THEMES,
		} );
	},

	fetchNextPage: function( site ) {
		Dispatcher.handleViewAction( {
			type: ThemeConstants.INCREMENT_THEMES_PAGE,
			site: site
		} );

		this[ site.jetpack ? 'fetchJetpack' : 'fetch' ]( site );
	},

	receiveThemes: function( data, site, queryParams, responseTime ) {
		Dispatcher.handleServerAction( {
			type: ThemeConstants.RECEIVE_THEMES,
			siteId: site.ID,
			isJetpack: !! site.jetpack,
			themes: data.themes,
			found: data.found,
			queryParams: queryParams,
			responseTime: responseTime
		} );

		if ( queryParams.search && queryParams.page === 1 ) {
			const { name, properties } = LastEventStore.getSearch();
			analytics.tracks.recordEvent( name, properties );
		}
	},

	receiveServerError: function( error ) {
		debug( 'Server error: ', error );
		Dispatcher.handleServerAction( {
			type: ThemeConstants.RECEIVE_THEMES_SERVER_ERROR,
			error: error
		} );
	},

	query: function( params ) {
		Dispatcher.handleViewAction( {
			type: ThemeConstants.QUERY_THEMES,
			params: params
		} );
	},

	fetchCurrentTheme: function( site ) {
		var callback = function( error, data ) {
			debug( 'Received current theme', data );
			if ( ! error ) {
				Dispatcher.handleServerAction( {
					type: ThemeConstants.RECEIVE_CURRENT_THEME,
					site: site,
					themeId: data.id,
					themeName: data.name
				} );
			}
		};
		wpcom.undocumented().activeTheme( site.ID, callback );
	},

	preview: function( theme, site ) {
		const previewUrl = ThemeHelpers.getPreviewUrl( theme, site );

		Dispatcher.handleViewAction( {
			type: ThemeConstants.PREVIEW_THEME,
			site: site
		} );

		ThemeHelpers.navigateTo( previewUrl, site.jetpack );
	},

	activate: function( theme, site, source = 'unknown' ) {
		var callback = function( err ) {
			if ( err ) {
				this.receiveServerError( err );
			} else {
				this.activated( theme, site, source );
			}
		}.bind( this );

		Dispatcher.handleViewAction( {
			type: ThemeConstants.ACTIVATE_THEME,
			theme: theme,
			site: site
		} );

		wpcom.undocumented().activateTheme( theme, site.ID, callback );
	},

	activated: function( theme, site, source = 'unknown', purchased = false ) {
		const previousTheme = CurrentThemeStore.getCurrentTheme( site.ID );

		if ( typeof theme !== 'object' ) {
			theme = ThemesStore.getById( theme );
		}

		defer( function() {
			Dispatcher.handleViewAction( {
				type: ThemeConstants.ACTIVATED_THEME,
				theme,
				site,
				previousTheme,
				source,
				purchased
			} );

			const { name, properties } = LastEventStore.getActivate();
			analytics.tracks.recordEvent( name, properties );
		} );
	},

	clearActivated: function() {
		Dispatcher.handleViewAction( {
			type: ThemeConstants.CLEAR_ACTIVATED_THEME
		} );
	},

	purchase: function( theme, site, source = 'unknown' ) {
		var CartActions = require( 'lib/upgrades/actions' ),
			themeItem = require( 'lib/cart-values/cart-items' ).themeItem;

		CartActions.addItem( themeItem( theme.id, source ) );

		defer( function() {
			page( '/checkout/' + site.slug );

			Dispatcher.handleViewAction( {
				type: ThemeConstants.PURCHASE_THEME,
				id: theme.id,
				site: site
			} );
		} );
	},

	details: function( theme, site ) {
		var detailsUrl = ThemeHelpers.getDetailsUrl( theme, site );

		Dispatcher.handleViewAction( {
			type: ThemeConstants.THEME_DETAILS,
			theme: theme
		} );

		ThemeHelpers.navigateTo( detailsUrl, site.jetpack );
	},

	support: function( theme, site ) {
		var supportUrl = ThemeHelpers.getSupportUrl( theme, site );

		Dispatcher.handleViewAction( {
			type: ThemeConstants.THEME_SUPPORT,
			theme: theme
		} );

		ThemeHelpers.navigateTo( supportUrl, site.jetpack );
	},

	customize: function( theme, site ) {
		var customizeUrl = ThemeHelpers.getCustomizeUrl( theme, site );

		Dispatcher.handleViewAction( {
			type: ThemeConstants.THEME_CUSTOMIZE,
			site: site.id
		} );

		ThemeHelpers.navigateTo( customizeUrl, site.jetpack );
	}
};

function hasSiteChanged() {
	return ThemesLastQueryStore.hasSiteChanged() ||
			! ThemesLastQueryStore.hasParams();
}

module.exports = ThemesActions;
