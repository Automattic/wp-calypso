import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { TOP_POSTS_SUPPORT_URL, JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
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
	summaryUrl,
	summary,
	listItemClassName,
	isRealTime = false,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportUrl = isOdysseyStats
		? `${ JETPACK_SUPPORT_URL_TRAFFIC }#analyzing-popular-posts-and-pages`
		: TOP_POSTS_SUPPORT_URL;

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	const hasData = !! data?.length;
	// TODO: Is there a way to show the Skeleton loader for real-time data?
	// We don't want it to show every time a rquest is being run for real-time data so it's disabled for now.
	const presentLoadingUI = isRealTime
		? isRequestingData && ! hasData && false
		: isRequestingData && ! shouldGateStatsModule;
	const presentModuleUI = isRealTime
		? hasData && ! presentLoadingUI
		: ( ! isRequestingData && hasData ) || shouldGateStatsModule;
	const presentEmptyUI = isRealTime
		? ! hasData && ! presentLoadingUI
		: ! isRequestingData && ! hasData && ! shouldGateStatsModule;

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ presentLoadingUI && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 1 }
				/>
			) }
			{ presentModuleUI && (
				// show data or an overlay
				<StatsModule
					path="posts"
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'{{link}}Posts and pages{{/link}} sorted by most visited. Learn about what content resonates the most.',
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
					isRealTime={ isRealTime }
				/>
			) }
			{ presentEmptyUI && (
				// show empty state
				<StatsCard
					className={ className }
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ postList }
							description={ translate(
								'Your top {{link}}posts and pages{{/link}} will display here to learn what content resonates the most. Start creating and sharing!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a target="_blank" rel="noreferrer" href={ localizeUrl( supportUrl ) } />,
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

export default StatsTopPosts;
