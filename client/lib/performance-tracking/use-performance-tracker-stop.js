/* global requestAnimationFrame:false */
/**
 * External dependencies
 */
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import { getSectionName } from 'state/ui/selectors';
import config from 'config';
import { getABTestVariation } from 'lib/abtest';
import { CONFIG_NAME, AB_NAME, AB_VARIATION_ON } from './const';

export function usePerformanceTrackerStop() {
	const sectionName = useSelector( getSectionName );
	const isEnabledForEnvironment = config.isEnabled( CONFIG_NAME );
	const isEnabledForCurrentInteraction = getABTestVariation( AB_NAME ) === AB_VARIATION_ON;

	// Use `useLayoutEffect` + rAF to be as close as possible to the actual rendering
	useLayoutEffect( () => {
		requestAnimationFrame( () => {
			if ( isEnabledForEnvironment && isEnabledForCurrentInteraction ) {
				stop( sectionName );
			}
		} );
	}, [ sectionName, isEnabledForEnvironment, isEnabledForCurrentInteraction ] );
}
