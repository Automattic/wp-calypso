import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { postAuthor } from '@wordpress/icons'; // TODO this isn't quite the right icon. Need to update when we can locate the correct icon
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import StatsModule from '../../../stats-module';
import StatsCardSkeleton from '../shared/stats-card-skeleton';

type StatClicksProps = {
	className?: string;
	period: string;
	query: {
		date: string;
		period: string;
	};
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

const StatClicks: React.FC< StatClicksProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	debugLoaders,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopAuthors';

	const requesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

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
					type={ 2 }
				/>
			) }
			{ ! isRequestingData && ! data?.length && (
				<StatsCard
					className={ className }
					title={ translate( 'Authors' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ postAuthor }
							description={ translate(
								'Learn about your most {{link}}popular authors{{/link}} to better understand how they contribute to grow your site.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#authors` ) } />,
									},
									context: 'Stats: Info box label when the Authors module is empty',
								}
							) }
						/>
					}
				>
					<></>
				</StatsCard>
			) }
			{ ! isRequestingData && !! data.length && (
				<StatsModule
					path="authors"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink
					className={ className }
				></StatsModule>
			) }
		</>
	);
};

export default StatClicks;
