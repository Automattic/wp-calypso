import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import { blockPostAuthor } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { AUTHORS_SUPPORT_URL, JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
import StatsModule from '../../../stats-module';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatAuthors: React.FC< StatsDefaultModuleProps > = ( {
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
	const statType = 'statsTopAuthors';
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportUrl = isOdysseyStats
		? `${ JETPACK_SUPPORT_URL_TRAFFIC }#authors`
		: AUTHORS_SUPPORT_URL;

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
					type={ 2 }
				/>
			) }
			{ ( ( ! isRequestingData && !! data?.length ) || shouldGateStatsModule ) && (
				// show data or an overlay
				<StatsModule
					path="authors"
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'Learn about your most {{link}}popular authors{{/link}} to better understand how they contribute to grow your site.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a target="_blank" rel="noreferrer" href={ localizeUrl( supportUrl ) } />,
									},
									context:
										'Stats: Link in a popover for the Posts & Pages when the module has data',
								}
							) }
						</StatsInfoArea>
					}
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
					title={ translate( 'Authors' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ blockPostAuthor }
							description={ translate(
								'Learn about your most {{link}}popular authors{{/link}} to better understand how they contribute to grow your site.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a target="_blank" rel="noreferrer" href={ localizeUrl( supportUrl ) } />,
									},
									context: 'Stats: Info box label when the Authors module is empty',
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

export default StatAuthors;
