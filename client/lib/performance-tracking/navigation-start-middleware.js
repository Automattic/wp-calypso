/**
 * Internal dependencies
 */
import config from 'config';

/**
 * External dependencies
 */
import { start } from '@automattic/browser-data-collector';

export const navigationStartMiddleware = ( pageName ) => {
	return ( context, next ) => {
		if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
			start( pageName || 'calypso', {
				fullPageLoad: context.init || false,
			} );
		}
		next();
	};
};
