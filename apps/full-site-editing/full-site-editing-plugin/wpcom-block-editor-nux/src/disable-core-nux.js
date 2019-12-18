/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { select, dispatch, subscribe } from '@wordpress/data';
import '@wordpress/nux'; //ensure nux store loads

dispatch( 'core/nux' ).disableTips();

subscribe( () => {
	if ( select( 'core/nux' ).areTipsEnabled() ) {
		dispatch( 'core/nux' ).disableTips();
		dispatch( 'automattic/nux' ).setWpcomNuxStatus( { isNuxEnabled: true } );
	}
} );
