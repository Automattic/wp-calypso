import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Site } from '../sites-overview/types';

export default function useJetpackAgencyDashboardRecordTrackEvent(
	sites: Array< Site > | null,
	isLargeScreen?: boolean
) {
	const dispatch = useDispatch();

	const buildEventName = useCallback(
		( action: string ) =>
			`calypso_jetpack_agency_dashboard_${ action }_${
				isLargeScreen ? 'large_screen' : 'small_screen'
			}`,
		[ isLargeScreen ]
	);

	const buildSiteProperties = useCallback( () => {
		if ( ! sites?.length ) {
			return {};
		}
		if ( sites.length === 1 ) {
			const { blog_id, url } = sites[ 0 ];
			return {
				selected_site_id: blog_id,
				selected_site_url: url,
			};
		}
		return {
			selected_site_count: sites.length,
		};
	}, [ sites ] );

	const dispatchTrackingEvent = useCallback(
		( action: string, args = {} ) => {
			const name = buildEventName( action );

			const properties = {
				...buildSiteProperties(),
				...args,
			};
			dispatch( recordTracksEvent( name, properties ) );
		},
		[ buildEventName, buildSiteProperties, dispatch ]
	);

	return dispatchTrackingEvent;
}
