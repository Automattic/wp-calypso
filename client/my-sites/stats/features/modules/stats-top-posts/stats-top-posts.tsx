import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
import StatsModule from '../../../stats-module';
import { StatsEmptyActionAI, StatsEmptyActionSocial } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsTopPosts: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	debugLoaders,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';
	// Use StatsModule to display paywall upsell.
	const shouldGateStatsTopPosts = useShouldGateStats( statType );

	const requesting = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	const isRequestingData = debugLoaders || ( requesting && ! data );

	return (
		<>
			{ siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 1 }
				/>
			) }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ ( ( ! isRequestingData && !! data?.length ) || shouldGateStatsTopPosts ) && (
				<StatsModule
					path="posts"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink
					className={ className } // TODO: extend with a base class after adding skeleton loaders
				/>
			) }
			{ ! isRequestingData && ! data?.length && (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) } // when removing stats/empty-module-traffic add this to the root of the card
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ trendingUp }
							description={ translate(
								'Your top {{link}}posts and pages{{/link}} will display here and learn what content resonates the most. Start creating and sharing!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#posts-amp-pages` ) } />,
									},
									context: 'Stats: Info box label when the Posts & Pages module is empty',
								}
							) }
							cards={
								<>
									<StatsEmptyActionAI from="module_top_posts" />
									<StatsEmptyActionSocial from="module_top_posts" />
								</>
							}
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsTopPosts;
