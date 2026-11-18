import { useEffect } from 'react';

const recordedViews = new Set< string >();

/**
 * Calls `record` the first time a component with this `key` mounts in the page
 * load. a8c-for-agencies remounts its sidebar between sections while the
 * dashboard keeps it, so counting per page load keeps view counts comparable.
 */
export function useRecordViewOnce( key: string, record: () => void ) {
	useEffect( () => {
		if ( recordedViews.has( key ) ) {
			return;
		}
		recordedViews.add( key );
		record();
	}, [ key, record ] );
}
