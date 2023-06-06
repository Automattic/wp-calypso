import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isRequestingSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useTracks from './use-tracks';
import type { AppState } from 'calypso/types';

const debug = debugFactory( 'calypso:my-sites:stats:StatsPageViewTracker' );

export interface StatsPageViewTrackerProps {
	path: string;
	title: string;
	properties?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function StatsPageViewTracker( props: StatsPageViewTrackerProps ) {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isLoadingSite = useSelector(
		( state: AppState ) =>
			! selectedSiteId || isRequestingSites( state ) || isRequestingSite( state, selectedSiteId )
	);

	// Tracking function is updated upon props change to handle these cases:
	// - when the selected site ID changes.
	// - when the selected site has been loaded.
	// - when the path, title, properties, or options have changed.
	const { queuePageView } = useTracks( {
		...props,
		isLoadingSite,
		selectedSiteId,
	} );

	useEffect( () => {
		debug( 'Component has mounted.' );
		queuePageView();
	}, [ queuePageView ] );

	useEffect( () => {
		queuePageView();
	}, [ selectedSiteId, queuePageView ] );

	return null;
}
