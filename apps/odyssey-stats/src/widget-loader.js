/**
 * The loader is to optimize page loading time of WP-Admin Dashboard.
 */

// `init-widget-config` has to be the first import, because there could be packages that reference it in their side effect.
import './lib/init-widget-config';

// Initialize Stats widget when DOMContentLoaded is fired, or immediately if it already has been.
function initStatsWidget() {
	return import( './widget' ).then( ( { init } ) => init() );
}
if ( document.readyState !== 'loading' ) {
	initStatsWidget();
} else {
	document.addEventListener( 'DOMContentLoaded', initStatsWidget );
}
