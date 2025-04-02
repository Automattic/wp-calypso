import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import EmptyModuleCard from 'calypso/my-sites/stats/components/empty-module-card/empty-module-card';
import { DOWNLOADS_SUPPORT_URL } from 'calypso/my-sites/stats/const';
import StatsCardSkeleton from 'calypso/my-sites/stats/features/modules/shared/stats-card-skeleton';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import StatsModule from 'calypso/my-sites/stats/stats-module';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type {
	StatsDefaultModuleProps,
	StatsStateProps,
} from 'calypso/my-sites/stats/features/modules/types';

const StatsDownloads: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	summaryUrl,
	summary,
	listItemClassName,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsFileDownloads';

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 3 }
				/>
			) }
			{ ( ( ! isRequestingData && !! data?.length ) || shouldGateStatsModule ) && (
				// show data or an overlay
				<StatsModule
					path="filedownloads"
					titleNodes={
						<StatsInfoArea>
							{ translate( 'Most {{link}}downloaded files{{/link}} from your site.', {
								comment: '{{link}} links to support documentation.',
								components: {
									link: (
										<a
											target="_blank"
											rel="noreferrer"
											href={ localizeUrl( DOWNLOADS_SUPPORT_URL ) }
										/>
									),
								},
								context: 'Stats: Info popover content when the file downloads module has data.',
							} ) }
						</StatsInfoArea>
					}
					metricLabel={ translate( 'Downloads' ) }
					useShortLabel
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink={ !! summary }
					className={ className }
					summary={ summary }
					listItemClassName={ listItemClassName }
					skipQuery
				/>
			) }
			{ ! isRequestingData && ! data?.length && ! shouldGateStatsModule && (
				// show empty state
				<StatsCard
					className={ className }
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ download }
							description={ translate(
								'Your most {{link}}downloaded files{{/link}} will display here.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a
												target="_blank"
												rel="noreferrer"
												href={ localizeUrl( DOWNLOADS_SUPPORT_URL ) }
											/>
										),
									},
									context: 'Stats: Info box label when the file downloads module is empty',
								}
							) }
						/>
					}
					footerAction={
						summaryUrl
							? {
									url: summaryUrl,
									label: translate( 'View more' ),
							  }
							: undefined
					}
				/>
			) }
		</>
	);
};

export default StatsDownloads;
