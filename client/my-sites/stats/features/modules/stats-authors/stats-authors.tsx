import { StatsCard } from '@automattic/components';
import { blockPostAuthor } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
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
import StatsModulePlaceholder from '../../../stats-module/placeholder';

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

const StatClicks: React.FC< StatClicksProps > = ( { period, query, moduleStrings, className } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopAuthors';

	const requesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	return (
		<>
			{ siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ ( ! data || ! data?.length ) && (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) }
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
			{ data && !! data.length && (
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
