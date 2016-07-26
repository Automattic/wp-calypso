/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:analytics' ),
	assign = require( 'lodash/assign' ),
	times = require( 'lodash/times' ),
	omit = require( 'lodash/omit' ),
	pickBy = require( 'lodash/pickBy' ),
	startsWith = require( 'lodash/startsWith' ),
	isUndefined = require( 'lodash/isUndefined' ),
	url = require( 'url' ),
	qs = require( 'qs' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	loadScript = require( 'lib/load-script' ).loadScript,
	_superProps,
	_user;

import { retarget } from 'lib/analytics/ad-tracking';
import emitter from 'lib/mixins/emitter';

// Load tracking scripts
window._tkq = window._tkq || [];
window.ga = window.ga || function() {
	( window.ga.q = window.ga.q || [] ).push( arguments );
};
window.ga.l = +new Date();

loadScript( '//stats.wp.com/w.js?53' ); // W_JS_VER
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

// we use this variable to track URL paths submitted to analytics.pageView.record
// so that analytics.pageLoading.record can re-use the urlPath parameter.
// this helps avoid some nasty coupling, but it's not the cleanest code - sorry.
var mostRecentUrlPath = null;

window.addEventListener('popstate', function() {
	// throw away our URL value if the user used the back/forward buttons
	mostRecentUrlPath = null;
});

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
			mostRecentUrlPath = urlPath;
			analytics.tracks.recordPageView( urlPath );
			analytics.ga.recordPageView( urlPath, pageTitle );
			analytics.emit( 'page-view', urlPath, pageTitle );
		}
	},

	timing: {
		record: function( eventType, duration, triggerName ) {
			var urlPath = mostRecentUrlPath || 'unknown';
			analytics.ga.recordTiming( urlPath, eventType, duration, triggerName );
			analytics.statsd.recordTiming( urlPath, eventType, duration, triggerName );
		}
	},

	tracks: {
		recordEvent: function( eventName, eventProperties ) {
			var superProperties;

			eventProperties = eventProperties || {};

			debug( 'Record event "%s" called with props %o', eventName, eventProperties );

			if ( eventName.indexOf( 'calypso_' ) !== 0 ) {
				debug( '- Event name must be prefixed by "calypso_"' );
				return;
			}

			if ( _superProps ) {
				superProperties = _superProps.getAll();
				debug( '- Super Props: %o', superProperties );
				eventProperties = assign( {}, eventProperties, superProperties ); // assign to a new object so we don't modify the argument
			}

			// Remove properties that have an undefined value
			// This allows a caller to easily remove properties from the recorded set by setting them to undefined
			eventProperties = omit( eventProperties, isUndefined );

			debug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

			window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
			analytics.emit( 'record-event', eventName, eventProperties );
		},

		recordPageView: function( urlPath ) {
			let eventProperties = {
				path: urlPath
			};

			// Record all `utm` marketing parameters as event properties on the page view event
			// so we can analyze their performance with our analytics tools
			if ( window.location ) {
				const parsedUrl = url.parse( window.location.href );
				const urlParams = qs.parse( parsedUrl.query );
				const utmParams = pickBy( urlParams, function( value, key ) {
					return startsWith( key, 'utm_' );
				} );

				eventProperties = assign( eventProperties, utmParams );
			}

			analytics.tracks.recordEvent( 'calypso_page_view', eventProperties );

			// Ensure every Calypso user is added to our retargeting audience via the AdWords retargeting tag
			retarget();
		},

		createRandomId:  function() {
			var randomBytesLength = 9, // 9 * 4/3 = 12 - this is to avoid getting padding of a random byte string when it is base64 encoded
					randomBytes = [];

			if ( window.crypto && window.crypto.getRandomValues ) {
				randomBytes = new Uint8Array( randomBytesLength );
				window.crypto.getRandomValues( randomBytes );
			} else {
				randomBytes = times( randomBytesLength, () => Math.floor( Math.random() * 256 ) );
			}

			return btoa( String.fromCharCode.apply( String, randomBytes ) );
		}

	},

	statsd: {
		recordTiming: function( pageUrl, eventType, duration, triggerName ) {
			// ignore triggerName for now, it has no obvious place in statsd
			if ( config( 'boom_analytics_enabled' ) ) {
				var featureSlug = pageUrl === '/' ? 'homepage' : pageUrl.replace(/^\//, '').replace(/\.|\/|:/g, '_');
				var matched;
				// prevent explosion of read list metrics
				// this is a hack - ultimately we want to report this URLs in a more generic way to
				// google analytics
				if ( startsWith( featureSlug, 'read_list' ) ) {
					featureSlug = 'read_list';
				} else if ( startsWith( featureSlug, 'tag_' ) ) {
					featureSlug = 'tag__id';
				} else if ( startsWith( featureSlug, 'domains_add_suggestion_' ) ) {
					featureSlug = 'domains_add_suggestion__suggestion__domain';
				} else if ( startsWith( document.location.pathname, '/plugins/browse/' ) ) {
					featureSlug = 'plugins_browse__site';
				} else if ( featureSlug.match( /^plugins_[^_].*__/ ) ) {
					featureSlug = 'plugins__site__plugin';
				} else if ( featureSlug.match( /^plugins_[^_]/ ) ) {
					featureSlug = 'plugins__site__unknown'; // fail safe because there seems to be some URLs we're not catching
				} else if ( startsWith( featureSlug, 'read_post_feed_' ) ) {
					featureSlug = 'read_post_feed__id';
				} else if ( startsWith( featureSlug, 'read_post_id_' ) ) {
					featureSlug = 'read_post_id__id';
				} else if ( ( matched = featureSlug.match( /^start_(.*)_(..)$/ ) ) != null ) {
					featureSlug = `start_${matched[1]}`;
				}

				var json = JSON.stringify({
					beacons:[
						'calypso.' + config( 'boom_analytics_key' ) + '.' + featureSlug + '.' + eventType.replace('-', '_') + ':' + duration + '|ms'
					]
				});

				new Image().src = 'https://pixel.wp.com/boom.gif?v=calypso&u=' + encodeURIComponent(pageUrl) + '&json=' + encodeURIComponent(json);
			}
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
		},

		recordTiming: function( urlPath, eventType, duration, triggerName ) {
			analytics.ga.initialize();

			debug( 'Recording Timing ~ [URL: ' + urlPath + '] [Duration: ' + duration + ']' );

			if ( config( 'google_analytics_enabled' ) ) {
				window.ga( 'send', 'timing', urlPath, eventType, duration, triggerName);
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
emitter( analytics );
module.exports = analytics;
