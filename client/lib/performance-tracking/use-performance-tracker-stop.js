/* global requestAnimationFrame:false */
/**
 * External dependencies
 */
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { stopPerformanceTracking } from './lib';
import { getSectionName } from 'state/ui/selectors';

export function usePerformanceTrackerStop() {
	const sectionName = useSelector( getSectionName );

	// Use `useLayoutEffect` + rAF to be as close as possible to the actual rendering
	useLayoutEffect( () => {
		requestAnimationFrame( () => {
			stopPerformanceTracking( sectionName );
		} );
	}, [ sectionName ] );
}
