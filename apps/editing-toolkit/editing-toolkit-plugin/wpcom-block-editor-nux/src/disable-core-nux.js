import { select, dispatch, subscribe } from '@wordpress/data';

import '@wordpress/nux'; //ensure nux store loads

// Disable nux and welcome guide features from core.
const unsubscribe = subscribe( () => {
	dispatch( 'core/nux' ).disableTips();
	if ( select( 'core/edit-post' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
	}
	if ( select( 'core/edit-site' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-site' ).toggleFeature( 'welcomeGuide' );
	}
	unsubscribe();
} );

// Listen for these features being triggered to call dotcom welcome guide instead.
// Note migration of areTipsEnabled: https://github.com/WordPress/gutenberg/blob/5c3a32dabe4393c45f7fe6ac5e4d78aebd5ee274/packages/data/src/plugins/persistence/index.js#L269
subscribe( () => {
	if ( select( 'core/nux' ).areTipsEnabled() ) {
		dispatch( 'core/nux' ).disableTips();
		dispatch( 'automattic/wpcom-welcome-guide' ).setShowWelcomeGuide( true );
	}
	if ( select( 'core/edit-post' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
		// if core side has the welcome guide feature is on, ask WPCOM server if we should turn it on as well
		dispatch( 'automattic/wpcom-welcome-guide' ).fetchWelcomeGuideStatus();
	}
	if ( select( 'core/edit-site' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-site' ).toggleFeature( 'welcomeGuide' );
		// if core side has the welcome guide feature is on, ask WPCOM server if we should turn it on as well
		dispatch( 'automattic/wpcom-welcome-guide' ).fetchWelcomeGuideStatus();
	}
} );
