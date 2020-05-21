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

export function usePerformanceTrackerStop() {
	const sectionName = useSelector( getSectionName );

	// Use `useLayoutEffect` + rAF to be as close as possible to the actual rendering
	useLayoutEffect( () => {
		requestAnimationFrame( () => {
			if ( config.isEnabled( 'rum-tracking/logstash' ) ) {
				stop( sectionName );
			}
		} );
	}, [ sectionName ] );
}
