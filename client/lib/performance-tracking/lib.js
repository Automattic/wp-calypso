/**
 * External dependencies
 */
import { start, stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { abtest } from 'lib/abtest';
import { CONFIG_NAME, AB_NAME, AB_VARIATION_ON } from './const';

const isPerformanceTrackingEnabled = () => {
	const isEnabledForEnvironment = config.isEnabled( CONFIG_NAME );
	const isEnabledForCurrentInteraction = abtest( AB_NAME ) === AB_VARIATION_ON;
	return isEnabledForEnvironment && isEnabledForCurrentInteraction;
};

export const startPerformanceTracking = ( name, fullPageLoad = false ) => {
	if ( isPerformanceTrackingEnabled() ) {
		start( name, { fullPageLoad } );
	}
};

export const stopPerformanceTracking = ( name ) => {
	if ( isPerformanceTrackingEnabled() ) {
		stop( name );
	}
};
