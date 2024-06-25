import { StatsCard } from '@automattic/components';
import { trendingUp, megaphone, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import EmptyStateAction from '../../../components/empty-state-action';
import StatsModule from '../../../stats-module';
import StatsModulePlaceholder from '../../../stats-module/placeholder';

type StatsTopPostsProps = {
	className?: string;
	period: string;
	query: string;
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

const StatsTopPosts: React.FC< StatsTopPostsProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';

	// TODO: sort out the state shape.
	const requesting = useSelector( ( state: any ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	const handleClick = () => {
		//console.log( 'do things' );
	};

	return (
		<>
			{ /* This will be replaced with ghost loaders, fallback to the current implementation until then. */ }
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ ( ! data || ! data?.length ) && (
				<StatsCard
					className={ className }
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ trendingUp }
							description={ moduleStrings.empty }
							cards={
								<>
									<EmptyStateAction
										icon={ starEmpty }
										text={ translate( 'Craft engaging content with Jetpack AI assistant' ) }
										analyticsDetails={ {
											from: 'module_top_posts',
											feature: 'ai_assistant',
										} }
										onClick={ handleClick }
									/>
									<EmptyStateAction
										icon={ megaphone }
										text={ translate( 'Share on social media with one click' ) }
										analyticsDetails={ {
											from: 'module_top_posts',
											feature: 'social_sharing',
										} }
										onClick={ handleClick }
									/>
								</>
							}
						/>
					}
				>
					<div>empty</div>
				</StatsCard>
			) }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ data && !! data.length && (
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
		</>
	);
};

export default StatsTopPosts;
