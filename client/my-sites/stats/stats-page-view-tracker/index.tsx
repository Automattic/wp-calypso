import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useTracks from './use-tracks';

export interface StatsPageViewTrackerProps {
	path: string;
	title: string;
	properties?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	from?: string;
}

// This component will pass through all properties to PageViewTracker from the analytics library.
// In addition, this component will fire a page view event unique to the stats pages.
export default function StatsPageViewTracker( props: StatsPageViewTrackerProps ) {
	const selectedSiteId = useSelector( getSelectedSiteId );

	// Tracking function is updated upon props change to handle these cases:
	// - when the selected site ID changes.
	// - when the path, title, properties, or options have changed.
	const { recordPageView } = useTracks( {
		...props,
		selectedSiteId,
	} );

	useEffect( () => {
		recordPageView();
	}, [ selectedSiteId, recordPageView ] );

	return <PageViewTracker { ...props } />;
}
