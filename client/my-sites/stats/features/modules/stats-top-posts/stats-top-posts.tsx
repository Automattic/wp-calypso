import clsx from 'clsx';
import { useSelector } from 'react-redux';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsModule from '../../../stats-module';
import StatsModulePlaceholder from '../../../stats-module/placeholder';

type StatsTopPostsProps = {
	period: string;
	query: string;
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

const StatsTopPosts: React.FC< StatsTopPostsProps > = ( { period, query, moduleStrings } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';

	// TODO: sort out the state shape.
	const requesting = useSelector( ( state: any ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	return (
		<>
			{ /* This will be replaced with ghost loaders, fallback to the current implementation until then. */ }
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ ( ! data || ! data?.length ) && <div>Nice empty states</div> }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ data && !! data.length && (
				<StatsModule
					path="posts"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType="statsTopPosts"
					showSummaryLink
					className={ clsx(
						'stats__flexible-grid-item--60',
						'stats__flexible-grid-item--full--large',
						'stats__flexible-grid-item--full--medium'
					) }
				/>
			) }
		</>
	);
};

export default StatsTopPosts;
