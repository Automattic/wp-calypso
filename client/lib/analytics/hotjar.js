/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { mayWeTrackCurrentUserGdpr, isPiiUrl } from './utils';
import { getDoNotTrack } from '@automattic/calypso-analytics';
import { isE2ETest } from 'lib/e2e';

const hotjarDebug = debug( 'calypso:analytics:hotjar' );

let hotJarScriptLoaded = false;

export function addHotJarScript() {
	if (
		hotJarScriptLoaded ||
		! config( 'hotjar_enabled' ) ||
		isE2ETest() ||
		getDoNotTrack() ||
		isPiiUrl() ||
		! mayWeTrackCurrentUserGdpr()
	) {
		hotjarDebug( 'Not loading HotJar script' );
		return;
	}

	( function ( h, o, t, j, a, r ) {
		hotjarDebug( 'Loading HotJar script' );
		h.hj =
			h.hj ||
			function () {
				( h.hj.q = h.hj.q || [] ).push( arguments );
			};
		h._hjSettings = { hjid: 227769, hjsv: 5 };
		a = o.getElementsByTagName( 'head' )[ 0 ];
		r = o.createElement( 'script' );
		r.async = 1;
		r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
		a.appendChild( r );
	} )( window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=' );

	hotJarScriptLoaded = true;
}
