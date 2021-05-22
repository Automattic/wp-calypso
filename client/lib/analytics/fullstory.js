/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { mayWeTrackCurrentUserGdpr, isPiiUrl } from './utils';
import { getCurrentUser, getDoNotTrack } from '@automattic/calypso-analytics';
import { isE2ETest } from 'calypso/lib/e2e';
import { TRACKING_IDS } from './ad-tracking/constants';

const fullStoryDebug = debug( 'calypso:analytics:fullstory' );

let fullStoryScriptLoaded = false;

export function retargetFullStory() {
	maybeAddFullStoryScript();

	if ( ! window.FS ) {
		return;
	}

	fullStoryDebug( 'retargetFullStory' );
	window.FS.restart();
	maybeIdentifyUser();
}

export function recordFullStoryEvent( name, _props ) {
	maybeAddFullStoryScript();

	if ( ! window.FS || ! name ) {
		return;
	}

	const props = suffixPropsAccordingToSpec( _props );
	fullStoryDebug( 'recordFullStoryEvent:', { name, props } );
	window.FS.event( name, props );
	maybeIdentifyUser();
}

function maybeAddFullStoryScript() {
	if (
		fullStoryScriptLoaded ||
		! config.isEnabled( 'fullstory' ) ||
		getDoNotTrack() ||
		isE2ETest() ||
		isPiiUrl() ||
		! mayWeTrackCurrentUserGdpr()
	) {
		if ( ! fullStoryScriptLoaded ) {
			fullStoryDebug( 'maybeAddFullStoryScript:', false );
		}
		return;
	}

	fullStoryScriptLoaded = true;
	fullStoryDebug( 'maybeAddFullStoryScript:', true );

	window._fs_debug = 'development' === process.env.NODE_ENV;
	window._fs_host = 'fullstory.com';
	window._fs_script = 'edge.fullstory.com/s/fs.js';
	window._fs_org = TRACKING_IDS.fullStory;
	window._fs_namespace = 'FS';

	( function ( m, n, e, t, l, o, g, y ) {
		fullStoryDebug( 'maybeAddFullStoryScript:', 'script loading' );
		if ( e in m ) {
			if ( m.console && m.console.log ) {
				m.console.log( 'FullStory namespace conflict. Please set window._fs_namespace.' );
			}
			return;
		}
		g = m[ e ] = function ( a, b, s ) {
			g.q ? g.q.push( [ a, b, s ] ) : g._api( a, b, s );
		};
		g.q = [];
		o = n.createElement( t );
		o.async = 1;
		o.crossOrigin = 'anonymous';
		o.src = 'https://' + window._fs_script;
		y = n.getElementsByTagName( t )[ 0 ];
		y.parentNode.insertBefore( o, y );
		g.identify = function ( i, v, s ) {
			g( l, { uid: i }, s );
			if ( v ) g( l, v, s );
		};
		g.setUserVars = function ( v, s ) {
			g( l, v, s );
		};
		g.event = function ( i, v, s ) {
			g( 'event', { n: i, p: v }, s );
		};
		g.anonymize = function () {
			g.identify( !! 0 );
		};
		g.shutdown = function () {
			g( 'rec', ! 1 );
		};
		g.restart = function () {
			g( 'rec', ! 0 );
		};
		g.log = function ( a, b ) {
			g( 'log', [ a, b ] );
		};
		g.consent = function ( a ) {
			g( 'consent', ! arguments.length || a );
		};
		g.identifyAccount = function ( i, v ) {
			o = 'account';
			v = v || {};
			v.acctId = i;
			g( o, v );
		};
		g.clearUserCookie = function () {};
		g.setVars = function ( _n, p ) {
			g( 'setVars', [ _n, p ] );
		};
		g._w = {};
		y = 'XMLHttpRequest';
		g._w[ y ] = m[ y ];
		y = 'fetch';
		g._w[ y ] = m[ y ];
		if ( m[ y ] )
			m[ y ] = function () {
				return g._w[ y ].apply( this, arguments );
			};
		g._v = '1.3.0';
	} )( window, document, window._fs_namespace, 'script', 'user' );
}

function maybeIdentifyUser() {
	if ( ! window.FS ) {
		return;
	}

	const currentUser = getCurrentUser();

	if ( currentUser ) {
		fullStoryDebug( 'maybeIdentifyUser:', currentUser );
		window.FS.identify( currentUser.hashedPii.ID );
	}
}

function suffixPropsAccordingToSpec( _props ) {
	const props = {};
	_props = typeof _props === 'object' ? _props : {};

	for ( const [ key, value ] of Object.entries( _props ) ) {
		const type = typeof value;

		if ( type === 'string' ) {
			props[ key + '_str' ] = value;
		} else if ( type === 'boolean' ) {
			props[ key + '_bool' ] = value;
		} else if ( type === 'number' || type === 'bigint' ) {
			if ( String( value ).indexOf( '.' ) !== -1 ) {
				props[ key + '_real' ] = value;
			} else {
				props[ key + '_int' ] = value;
			}
		} else if ( type === 'object' ) {
			props[ key ] = suffixPropsAccordingToSpec( value );
		}
	}

	return props;
}
