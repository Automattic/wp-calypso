/**
 * External dependencies
 */
const debug = require( 'debug' ),
	assign = require( 'lodash/assign' ),
	isObjectLike = require( 'lodash/isObjectLike' ),
	times = require( 'lodash/times' ),
	omit = require( 'lodash/omit' ),
	pickBy = require( 'lodash/pickBy' ),
	startsWith = require( 'lodash/startsWith' ),
	isUndefined = require( 'lodash/isUndefined' ),
	url = require( 'url' ),
	qs = require( 'qs' );

import cookie from 'cookie';

/**
 * Internal dependencies
 */
const config = require( 'config' ),
	loadScript = require( 'lib/load-script' ).loadScript;

let _superProps,
	_user,
	_selectedSite,
	_siteCount,
	_dispatch;

import { retarget, recordAliasInFloodlight, recordPageViewInFloodlight } from 'lib/analytics/ad-tracking';
import { ANALYTICS_SUPER_PROPS_UPDATE } from 'state/action-types';
const mcDebug = debug( 'calypso:analytics:mc' );
const gaDebug = debug( 'calypso:analytics:ga' );
const tracksDebug = debug( 'calypso:analytics:tracks' );

import emitter from 'lib/mixins/emitter';

// Load tracking scripts
window._tkq = window._tkq || [];
window.ga = window.ga || function() {
	( window.ga.q = window.ga.q || [] ).push( arguments );
};
window.ga.l = +new Date();

loadScript( '//stats.wp.com/w.js?56' ); // W_JS_VER
loadScript( '//www.google-analytics.com/analytics.js' );

function buildQuerystring( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

function buildQuerystringNoPrefix( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[ key ] );
		}
	} else {
		uriComponent = '&' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

// we use this variable to track URL paths submitted to analytics.pageView.record
// so that analytics.pageLoading.record can re-use the urlPath parameter.
// this helps avoid some nasty coupling, but it's not the cleanest code - sorry.
let mostRecentUrlPath = null;

if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'popstate', function() {
		// throw away our URL value if the user used the back/forward buttons
		mostRecentUrlPath = null;
	} );
}

const analytics = {
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

	setSelectedSite: function( selectedSite ) {
		_selectedSite = selectedSite;
	},

	setSiteCount: function( siteCount ) {
		_siteCount = siteCount;
	},

	setDispatch: function( dispatch ) {
		_dispatch = dispatch;
	},

	mc: {
		bumpStat: function( group, name ) {
			if ( 'object' === typeof group ) {
				mcDebug( 'Bumping stats %o', group );
			} else {
				mcDebug( 'Bumping stat %s:%s', group, name );
			}

			if ( config( 'mc_analytics_enabled' ) ) {
				const uriComponent = buildQuerystring( group, name );
				new Image().src = document.location.protocol + '//pixel.wp.com/g.gif?v=wpcom-no-pv' + uriComponent + '&t=' + Math.random();
			}
		},

		bumpStatWithPageView: function( group, name ) {
			// this function is fairly dangerous, as it bumps page views for wpcom and should only be called in very specific cases.
			if ( 'object' === typeof group ) {
				mcDebug( 'Bumping page view with props %o', group );
			} else {
				mcDebug( 'Bumping page view %s:%s', group, name );
			}

			if ( config( 'mc_analytics_enabled' ) ) {
				const uriComponent = buildQuerystringNoPrefix( group, name );
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
			const urlPath = mostRecentUrlPath || 'unknown';
			analytics.ga.recordTiming( urlPath, eventType, duration, triggerName );
			analytics.statsd.recordTiming( urlPath, eventType, duration, triggerName );
		}
	},

	tracks: {
		recordEvent: function( eventName, eventProperties ) {
			let superProperties;

			eventProperties = eventProperties || {};

			if ( process.env.NODE_ENV !== 'production' ) {
				for ( const key in eventProperties ) {
					if ( isObjectLike( eventProperties[ key ] ) && typeof console !== 'undefined' ) {
						const errorMessage = (
							`Unable to record event "${ eventName }" because nested` +
							`properties are not supported by Tracks. Check '${ key }' on`
						);
						console.error( errorMessage, eventProperties ); //eslint-disable-line no-console

						return;
					}
				}
			}

			tracksDebug( 'Record event "%s" called with props %o', eventName, eventProperties );

			if ( eventName.indexOf( 'calypso_' ) !== 0 ) {
				tracksDebug( '- Event name must be prefixed by "calypso_"' );
				return;
			}

			if ( _superProps ) {
				_dispatch && _dispatch( { type: ANALYTICS_SUPER_PROPS_UPDATE } );
				superProperties = _superProps.getAll( _selectedSite, _siteCount );
				eventProperties = assign( {}, eventProperties, superProperties ); // assign to a new object so we don't modify the argument
			}

			// Remove properties that have an undefined value
			// This allows a caller to easily remove properties from the recorded set by setting them to undefined
			eventProperties = omit( eventProperties, isUndefined );

			tracksDebug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

			window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
			analytics.emit( 'record-event', eventName, eventProperties );
		},

		recordPageView: function( urlPath ) {
			let eventProperties = {
				path: urlPath,
				do_not_track: '1' === navigator.doNotTrack ? 1 : 0
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

			// Track the page view with DCM Floodlight as well
			recordPageViewInFloodlight( urlPath );
		},

		createRandomId: function() {
			// this is to avoid getting padding of a random byte string when it is base64 encoded
			const randomBytesLength = 9; // 9 * 4/3 = 12
			let randomBytes;

			if ( window.crypto && window.crypto.getRandomValues ) {
				randomBytes = new Uint8Array( randomBytesLength );
				window.crypto.getRandomValues( randomBytes );
			} else {
				randomBytes = times( randomBytesLength, () => Math.floor( Math.random() * 256 ) );
			}

			return btoa( String.fromCharCode.apply( String, randomBytes ) );
		},

		/**
		 * Returns the anoymous id stored in the `tk_ai` cookie
		 *
		 * @returns {String} - The Tracks anonymous user id
		 */
		anonymousUserId: function() {
			const cookies = cookie.parse( document.cookie );

			return cookies.tk_ai;
		}
	},

	statsd: {
		/* eslint-disable no-unused-vars */
		recordTiming: function( pageUrl, eventType, duration, triggerName ) {
		// ignore triggerName for now, it has no obvious place in statsd
		/* eslint-enable no-unused-vars */

			if ( config( 'boom_analytics_enabled' ) ) {
				let featureSlug = pageUrl === '/' ? 'homepage' : pageUrl.replace( /^\//, '' ).replace( /\.|\/|:/g, '_' );
				let matched;
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
					featureSlug = `start_${ matched[ 1 ] }`;
				}

				const type = eventType.replace( '-', '_' );
				const json = JSON.stringify( {
					beacons: [
						`calypso.${ config( 'boom_analytics_key' ) }.${ featureSlug }.${ type }:${ duration }|ms`
					]
				} );

				const [ encodedUrl, jsonData ] = [ pageUrl, json ].map( encodeURIComponent );
				new Image().src = `https://pixel.wp.com/boom.gif?v=calypso&u=${ encodedUrl }&json=${ jsonData }`;
			}
		}
	},

	// Google Analytics usage and event stat tracking
	ga: {

		initialized: false,

		initialize: function() {
			const parameters = {};
			if ( ! analytics.ga.initialized ) {
				if ( _user && _user.get() ) {
					parameters.userId = 'u-' + _user.get().ID;
				}

				window.ga( 'create', config( 'google_analytics_key' ), 'auto', parameters );

				// Load the Ecommerce Plugin
				window.ga( 'require', 'ecommerce' );

				analytics.ga.initialized = true;
			}
		},

		recordPageView: function( urlPath, pageTitle ) {
			analytics.ga.initialize();

			gaDebug( 'Recording Page View ~ [URL: ' + urlPath + '] [Title: ' + pageTitle + ']' );

			if ( config( 'google_analytics_enabled' ) ) {
				// Set the current page so all GA events are attached to it.
				window.ga( 'set', 'page', urlPath );

				window.ga( 'send', {
					hitType: 'pageview',
					page: urlPath,
					title: pageTitle
				} );
			}
		},

		recordEvent: function( category, action, label, value ) {
			analytics.ga.initialize();

			let debugText = 'Recording Event ~ [Category: ' + category + '] [Action: ' + action + ']';

			if ( 'undefined' !== typeof label ) {
				debugText += ' [Option Label: ' + label + ']';
			}

			if ( 'undefined' !== typeof value ) {
				debugText += ' [Option Value: ' + value + ']';
			}

			gaDebug( debugText );

			if ( config( 'google_analytics_enabled' ) ) {
				window.ga( 'send', 'event', category, action, label, value );
			}
		},

		recordTiming: function( urlPath, eventType, duration, triggerName ) {
			analytics.ga.initialize();

			gaDebug( 'Recording Timing ~ [URL: ' + urlPath + '] [Duration: ' + duration + ']' );

			if ( config( 'google_analytics_enabled' ) ) {
				window.ga( 'send', 'timing', urlPath, eventType, duration, triggerName );
			}
		}
	},

	// Lucky Orange tracking
	luckyOrange: {
		addLuckyOrangeScript: function() {
			const wa = document.createElement( 'script' );
			const s = document.getElementsByTagName( 'script' )[ 0 ];

			window.__lo_site_id = 77942;
			wa.type = 'text/javascript';
			wa.async = true;
			wa.src = 'https://d10lpsik1i8c69.cloudfront.net/w.js';
			s.parentNode.insertBefore( wa, s );
		}
	},

	identifyUser: function() {
		const anonymousUserId = this.tracks.anonymousUserId();

		// Don't identify the user if we don't have one
		if ( _user && _user.initialized ) {
			if ( anonymousUserId ) {
				recordAliasInFloodlight();
			}

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
