import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent, enhanceWithSiteType } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { StatsPageViewTrackerProps } from './index';
import type { AnyAction, Store } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

const debug = debugFactory( 'calypso:my-sites:stats:StatsPageViewTracker:useTracks' );

const CALYPSO_STATS_PAGE_VIEW_EVENT_NAME = 'calypso_stats_page_view';
const ODYSSEY_STATS_PAGE_VIEW_EVENT_NAME = 'odyssey_stats_page_view';

interface useTracksProps extends StatsPageViewTrackerProps {
	isLoadingSite: boolean;
	selectedSiteId: number | null;
}

export default function useTracks( {
	// These are the props from StatsPageViewTracker.
	options,
	path,
	properties,
	title,

	// These are the props from the useSelector calls in StatsPageViewTracker.
	isLoadingSite,
	selectedSiteId,
}: useTracksProps ) {
	const dispatch = useDispatch() as ThunkDispatch< Store, void, AnyAction >;

	const recordPageView = useCallback( () => {
		debug( `Recording Stats Page View: "${ title }" at "${ path }"` );
		const recordEvent = withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] );

		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
		const eventName = isOdysseyStats
			? ODYSSEY_STATS_PAGE_VIEW_EVENT_NAME
			: CALYPSO_STATS_PAGE_VIEW_EVENT_NAME;
		const eventProperties = {
			blog_id: selectedSiteId,
			options,
			path,
			properties,
			title,
		};
		dispatch( recordEvent( eventName, eventProperties ) );
	}, [ dispatch, options, path, properties, selectedSiteId, title ] );

	const queuePageView = useCallback( () => {
		if ( isLoadingSite ) {
			debug(
				`Page view not queued: "${ title }" at "${ path }". Selected site has not been loaded.`
			);
			return;
		}
		recordPageView();
	}, [ isLoadingSite, path, recordPageView, title ] );

	return { queuePageView };
}
