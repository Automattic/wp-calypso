import { StatsCard } from '@automattic/components';
import { search } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import InlineSupportLink from 'calypso/components/inline-support-link';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
import StatsModule from '../../../stats-module';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatSearch: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	summaryUrl,
	summary,
	listItemClassName,
}: StatsDefaultModuleProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsSearchTerms';

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const supportContext = isSiteJetpackNotAtomic
		? 'stats-search-terms-jetpack'
		: 'stats-search-terms';

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
				<StatsModule
					path="searchterms"
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'Learn about {{link}}popular terms{{/link}} visitors use to find your site content on search engines.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
										),
									},
									context: 'Stats: Info box label when the Search module is empty',
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
				<StatsCard
					className={ className }
					title={ translate( 'Search' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ search }
							description={ translate(
								'Learn about {{link}}popular terms{{/link}} visitors use to find your site content on search engines.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
										),
									},
									context: 'Stats: Info box label when the Search module is empty',
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

export default StatSearch;
