/**
 * The loader is to optimize page loading time of WP-Admin Dashboard.
 */

// `init-widget-config` has to be the first import, because there could be packages that reference it in their side effect.
import './lib/init-widget-config';
import { isEnabled, optionalConfig } from './lib/config-api';
import renderLoadingSkeleton from './widget/loading-skeleton';

// Initialize Stats widget when DOMContentLoaded is fired, or immediately if it already has been.
function initStatsWidget() {
	renderLoadingSkeleton( document.getElementById( 'dashboard_stats' ), {
		// The gates `Modules` applies: no Site protection on Simple sites, nor on a standalone
		// Stats plugin without Jetpack, which prints an empty `jetpack_version`.
		hasSiteProtection:
			isEnabled( 'is_running_in_jetpack_site' ) && optionalConfig( 'jetpack_version' ) !== '',
	} );
	return import( './widget' ).then( ( { init } ) => init() );
}
if ( document.readyState !== 'loading' ) {
	initStatsWidget();
} else {
	document.addEventListener( 'DOMContentLoaded', initStatsWidget );
}
