import config from '@automattic/calypso-config';
import {
	WeeklyHighlightCards,
	PAST_THIRTY_DAYS,
	BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS,
	BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS,
} from '@automattic/components';
import { useEffect, useMemo, useState } from 'react';
import version_compare from 'calypso/lib/version-compare';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useDispatch, useSelector } from 'calypso/state';
import { getJetpackStatsAdminVersion } from 'calypso/state/sites/selectors';
import { requestHighlights } from 'calypso/state/stats/highlights/actions';
import { getHighlights } from 'calypso/state/stats/highlights/selectors';
import { updateModuleSettings } from 'calypso/state/stats/module-settings/actions';

export default function HighlightsSection( {
	siteId,
	currentPeriod,
}: {
	siteId: number;
	currentPeriod: string;
} ) {
	const dispatch = useDispatch();

	// Request new highlights whenever site ID changes.
	useEffect( () => {
		dispatch( requestHighlights( siteId ) );
	}, [ dispatch, siteId ] );

	const onUpdatePeriod = ( period: string ) => {
		dispatch(
			updateModuleSettings( siteId, {
				traffic: { highlights: { period_in_days: period === PAST_THIRTY_DAYS ? 30 : 7 } },
			} )
		);
	};

	const highlights = useSelector( ( state ) => getHighlights( state, siteId ) );
	const counts = useMemo(
		() => ( {
			comments: highlights[ currentPeriod ]?.comments ?? null,
			likes: highlights[ currentPeriod ]?.likes ?? null,
			views: highlights[ currentPeriod ]?.views ?? null,
			visitors: highlights[ currentPeriod ]?.visitors ?? null,
		} ),
		[ highlights, currentPeriod ]
	);
	const previousCounts = useMemo( () => {
		const comparePeriod =
			currentPeriod === PAST_THIRTY_DAYS
				? BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS
				: BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS;
		return {
			comments: highlights[ comparePeriod ]?.comments ?? null,
			likes: highlights[ comparePeriod ]?.likes ?? null,
			views: highlights[ comparePeriod ]?.views ?? null,
			visitors: highlights[ comparePeriod ]?.visitors ?? null,
		};
	}, [ highlights, currentPeriod ] );

	const { data: showSettingsTooltip, refetch: refetchNotices } = useNoticeVisibilityQuery(
		siteId,
		'traffic_page_highlights_module_settings'
	);
	const { mutateAsync: mutateNoticeVisbilityAsync } = useNoticeVisibilityMutation(
		siteId,
		'traffic_page_highlights_module_settings'
	);
	const [ settingsTooltipDismissed, setSettingsTooltipDismissed ] = useState(
		!! localStorage.getItem( 'notices_dismissed__traffic_page_highlights_module_settings' )
	);

	const dismissSettingsTooltip = () => {
		setSettingsTooltipDismissed( true );
		localStorage.setItem( 'notices_dismissed__traffic_page_highlights_module_settings', '1' );
		return mutateNoticeVisbilityAsync().finally( refetchNotices );
	};

	const statsAdminVersion = useSelector( ( state ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);

	// Highlights settings for Odyssey are not supported until stats-admin@0.9.0-alpha.
	const isHighlightsSettingsSupported = useMemo(
		() =>
			! (
				config.isEnabled( 'is_running_in_jetpack_site' ) &&
				( ! statsAdminVersion || version_compare( statsAdminVersion, '0.9.0-alpha', '<' ) )
			),
		[ statsAdminVersion ]
	);

	return (
		<WeeklyHighlightCards
			className="has-odyssey-stats-bg-color"
			counts={ counts }
			previousCounts={ previousCounts }
			showValueTooltip={ true }
			onClickComments={ () => null }
			onClickLikes={ () => null }
			onClickViews={ () => null }
			onClickVisitors={ () => null }
			onTogglePeriod={ onUpdatePeriod }
			currentPeriod={ currentPeriod }
			showSettingsTooltip={ !! showSettingsTooltip && ! settingsTooltipDismissed }
			onSettingsTooltipDismiss={ dismissSettingsTooltip }
			isHighlightsSettingsSupported={ isHighlightsSettingsSupported }
		/>
	);
}
