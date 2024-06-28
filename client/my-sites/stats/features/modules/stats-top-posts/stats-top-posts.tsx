import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
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
import { SUPPORT_URL } from '../../../const';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
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

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_AI_URL =
	'https://jetpack.com/support/jetpack-blocks/jetpack-ai-assistant-block/';
const JETPACK_SUPPORT_SOCIAL_URL = 'https://jetpack.com/support/jetpack-social/';

const StatsTopPosts: React.FC< StatsTopPostsProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';
	// Use StatsModule to display paywall upsell.
	const shouldGateStatsTopPosts = useShouldGateStats( statType );

	// TODO: sort out the state shape.
	const requesting = useSelector( ( state: any ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	const cardActions = [
		{
			icon: starEmpty,
			text: translate( 'Craft engaging content with Jetpack AI assistant' ),
			onClick: () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout( () => ( window.location.href = localizeUrl( JETPACK_SUPPORT_AI_URL ) ), 250 );
			},
			analyticsDetails: {
				from: 'module_top_posts',
				feature: 'ai_assistant',
			},
		},
		{
			icon: megaphone,
			text: translate( 'Share on social media with one click' ),
			onClick: () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout(
					() => ( window.location.href = localizeUrl( JETPACK_SUPPORT_SOCIAL_URL ) ),
					250
				);
			},
			analyticsDetails: {
				from: 'module_top_posts',
				feature: 'social_sharing',
			},
		},
	];

	return (
		<>
			{ /* This will be replaced with ghost loaders, fallback to the current implementation until then. */ }
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ ( data && !! data.length ) || shouldGateStatsTopPosts ? (
				<StatsModule
					path="posts"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink
					className={ className } // TODO: extend with a base class after adding skeleton loaders
				/>
			) : (
				<StatsCard
					className={ className }
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
							cards={ cardActions.map( ( action, index ) => (
								<EmptyStateAction
									key={ index }
									icon={ action.icon }
									text={ action.text }
									analyticsDetails={ action.analyticsDetails }
									onClick={ action.onClick }
								/>
							) ) }
						/>
					}
				>
					<div>empty</div>
				</StatsCard>
			) }
		</>
	);
};

export default StatsTopPosts;
