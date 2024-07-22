import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { tag } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { INSIGHTS_SUPPORT_URL } from '../../../const';
import StatsModule from '../../../stats-module';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsTags: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTags';

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
				<QuerySiteStats statType={ statType } siteId={ siteId } />
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
					path="tags-categories"
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'Most visited {{link}}tags & categories{{/link}}. Learn about the most engaging topics. ',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a href={ localizeUrl( `${ INSIGHTS_SUPPORT_URL }#all-time-insights` ) } />
										),
									},
									context: 'Stats: Info box label when the Tags & Categories module has data',
								}
							) }
						</StatsInfoArea>
					}
					moduleStrings={ moduleStrings }
					period={ period }
					statType={ statType }
					hideSummaryLink
					className={ className }
					skipQuery
				/>
			) }
			{ ! isRequestingData && ! data?.length && ! shouldGateStatsModule && (
				// show empty state
				<StatsCard
					className={ className }
					title={ translate( 'Tags & Categories' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ tag }
							description={ translate(
								'Learn about your most visited {{link}}tags & categories{{/link}} to track engaging topics. ',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a href={ localizeUrl( `${ INSIGHTS_SUPPORT_URL }#all-time-insights` ) } />
										),
									},
									context: 'Stats: Info box label when the Tags & Categories module is empty',
								}
							) }
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsTags;
