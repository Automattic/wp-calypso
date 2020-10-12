/**
 * External dependencies
 */
import { select, dispatch, subscribe } from '@wordpress/data';
import '@wordpress/nux'; //ensure nux store loads

// Disable nux and welcome guide features from core.
const unsubscribe = subscribe( () => {
	dispatch( 'core/nux' ).disableTips();
	if ( select( 'core/edit-post' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
	}
	unsubscribe();
} );

// Listen for these features being triggered to call dotcom nux instead.
subscribe( () => {
	if ( select( 'core/nux' ).areTipsEnabled() ) {
		dispatch( 'core/nux' ).disableTips();
		dispatch( 'automattic/nux' ).setWpcomNuxStatus( { isNuxEnabled: true } );
	}
	if ( select( 'core/edit-post' )?.isFeatureActive( 'welcomeGuide' ) ) {
		dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
		dispatch( 'automattic/nux' ).setWpcomNuxStatus( { isNuxEnabled: true } );
	}
} );
