import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
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

// This component will pass through all properties to PageViewTracker from the analytics library.
// In addition, this component will fire a page view event unique to the stats pages.
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

	return <PageViewTracker { ...props } />;
}
