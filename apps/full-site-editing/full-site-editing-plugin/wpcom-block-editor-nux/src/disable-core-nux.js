/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { select, dispatch, subscribe } from '@wordpress/data';

dispatch( 'core/nux' ).disableTips();

subscribe( () => {
	if ( select( 'core/nux' ).areTipsEnabled() ) {
		dispatch( 'core/nux' ).disableTips();
		dispatch( 'automattic/nux' ).setWpcomNuxStatus( true );
		apiFetch( {
			path: 'fse/v1/wpcom-block-editor/nux',
			method: 'POST',
			data: { isNuxEnabled: true },
		} );
	}
} );
import '@wordpress/nux'; //ensure nux store loads
