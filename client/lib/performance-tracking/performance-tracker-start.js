/**
 * External dependencies
 */
import { start } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import { CONFIG_NAME, AB_NAME, AB_VARIATION_ON } from './const';

export const performanceTrackerStart = ( pageName ) => {
	return ( context, next ) => {
		const isEnabledForEnvironment = config.isEnabled( CONFIG_NAME );
		const isEnabledForCurrentInteraction = abtest( AB_NAME ) === AB_VARIATION_ON;
		if ( isEnabledForEnvironment && isEnabledForCurrentInteraction ) {
			start( pageName || 'calypso', {
				fullPageLoad: context.init || false,
			} );
		}
		next();
	};
};
