import { useLayoutEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { stopPerformanceTracking } from './lib';

export function usePerformanceTrackerStop() {
	const sectionName = useSelector( getSectionName );
	const store = useStore();

	// Use `useLayoutEffect` + rAF to be as close as possible to the actual rendering
	useLayoutEffect( () => {
		requestAnimationFrame( () => {
			stopPerformanceTracking( sectionName, { state: store.getState() } );
		} );
	}, [ sectionName, store ] );
}
