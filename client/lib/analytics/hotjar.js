import config from '@automattic/calypso-config';
import debug from 'debug';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { mayWeTrackByTracker } from './tracker-buckets';

const hotjarDebug = debug( 'calypso:analytics:hotjar' );

let hotJarScriptLoaded = false;

export function mayWeLoadHotJarScript() {
	return config( 'hotjar_enabled' ) && mayWeTrackByTracker( 'hotjar' );
}

export function getHotjarSiteSettings() {
	// Automattic for Agencies (agencies.automattic.com)
	if ( isA8CForAgencies() ) {
		return { hjid: 6527274, hjsv: 6 };
	}

	// Jetpack Cloud (cloud.jetpack.com)
	if ( isJetpackCloud() ) {
		return { hjid: 3165344, hjsv: 6 };
	}

	// WordPress.com (wordpress.com)
	return { hjid: 227769, hjsv: 5 };
}

export function addHotJarScript() {
	if ( hotJarScriptLoaded || ! mayWeLoadHotJarScript() ) {
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
		h._hjSettings = getHotjarSiteSettings();
		a = o.getElementsByTagName( 'head' )[ 0 ];
		r = o.createElement( 'script' );
		r.async = 1;
		r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
		a.appendChild( r );
	} )( window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=' );

	hotJarScriptLoaded = true;
}
