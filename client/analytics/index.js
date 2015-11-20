/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:analytics' ),
	assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	loadScript = require( 'lib/load-script' ).loadScript,
	_superProps,
	_user;

// Load tracking scripts
window._tkq = window._tkq || [];
window.ga = window.ga || function() {
		( window.ga.q = window.ga.q || [] ).push( arguments );
	};
window.ga.l = +new Date();

loadScript( '//stats.wp.com/w.js?48' );
loadScript( '//www.google-analytics.com/analytics.js' );

function buildQuerystring( group, name ) {
	var uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( var key in group ) {
			uriComponent += '&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
		debug( 'Bumping stats %o', group );
	} else {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
		debug( 'Bumping stat "%s" in group "%s"', name, group );
	}

	return uriComponent;
}

function buildQuerystringNoPrefix( group, name ) {
	var uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( var key in group ) {
			uriComponent += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
		debug( 'Built stats %o', group );
	} else {
		uriComponent = '&' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
		debug( 'Built stat "%s" in group "%s"', name, group );
	}

	return uriComponent;
}

var analytics = {

	initialize: function( user, superProps ) {
		analytics.setUser( user );
		analytics.setSuperProps( superProps );
		analytics.identifyUser();
	},

	setUser: function( user ) {
		_user = user;
	},

	setSuperProps: function( superProps ) {
		_superProps = superProps;
	},

	mc: {
		bumpStat: function( group, name ) {
			var uriComponent = buildQuerystring( group, name ); // prints debug info
			if ( config( 'mc_analytics_enabled' ) ) {
				new Image().src = document.location.protocol + '//pixel.wp.com/g.gif?v=wpcom-no-pv' + uriComponent + '&t=' + Math.random();
			}
		},

		bumpStatWithPageView: function( group, name ) {
			// this function is fairly dangerous, as it bumps page views for wpcom and should only be called in very specific cases.
			var uriComponent = buildQuerystringNoPrefix( group, name ); // prints debug info
			if ( config( 'mc_analytics_enabled' ) ) {
				new Image().src = document.location.protocol + '//pixel.wp.com/g.gif?v=wpcom' + uriComponent + '&t=' + Math.random();
			}
		}
	},

	// pageView is a wrapper for pageview events across Tracks and GA
	pageView: {
		record: function( urlPath, pageTitle ) {
			analytics.tracks.recordPageView( urlPath );
			analytics.ga.recordPageView( urlPath, pageTitle );
		}
	},

	tracks: {
		recordEvent: function( eventName, eventProperties ) {
			var superProperties;

			eventProperties = eventProperties || {};

			debug( 'Record event "%s" called with props %s', eventName, JSON.stringify( eventProperties ) );

			if ( eventName.indexOf( 'calypso_' ) !== 0 ) {
				debug( '- Event name must be prefixed by "calypso_"' );
				return;
			}

			if ( _superProps ) {
				superProperties = _superProps.getAll();
				debug( '- Super Props: %o', superProperties );
				eventProperties = assign( eventProperties, superProperties );
			}

			window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
		},

		recordPageView: function( urlPath ) {
			analytics.tracks.recordEvent( 'calypso_page_view', {
				'path': urlPath
			} );
		}
	},

	// Google Analytics usage and event stat tracking
	ga: {

		initialized: false,

		initialize: function() {
			var parameters = {};
			if ( ! analytics.ga.initialized ) {
				if ( _user && _user.get() ) {
					parameters = {
						'userId': 'u-' + _user.get().ID
					};
				}
				window.ga( 'create', config( 'google_analytics_key' ), 'auto', parameters );
				analytics.ga.initialized = true;
			}
		},

		recordPageView: function( urlPath, pageTitle ) {
			analytics.ga.initialize();

			debug( 'Recording Page View ~ [URL: ' + urlPath + '] [Title: ' + pageTitle + ']' );

			if ( config( 'google_analytics_enabled' ) ) {
				// Set the current page so all GA events are attached to it.
				window.ga( 'set', 'page', urlPath );

				window.ga( 'send', {
					'hitType': 'pageview',
					'page': urlPath,
					'title': pageTitle
				} );
			}
		},

		recordEvent: function( category, action, label, value ) {
			analytics.ga.initialize();

			var debugText = 'Recording Event ~ [Category: ' + category + '] [Action: ' + action + ']';

			if ( 'undefined' !== typeof label ) {
				debugText += ' [Option Label: ' + label + ']';
			}

			if ( 'undefined' !== typeof value ) {
				debugText += ' [Option Value: ' + value + ']';
			}

			debug( debugText );

			if ( config( 'google_analytics_enabled' ) ) {
				window.ga( 'send', 'event', category, action, label, value );
			}
		}
	},

	identifyUser: function() {
		// Don't identify the user if we don't have one
		if ( _user && _user.initialized ) {
			window._tkq.push( [ 'identifyUser', _user.get().ID, _user.get().username ] );
		}
	},

	setProperties: function( properties ) {
		window._tkq.push( [ 'setProperties', properties ] );
	},

	clearedIdentity: function() {
		window._tkq.push( [ 'clearIdentity' ] );
	}
};

module.exports = analytics;
