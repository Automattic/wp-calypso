import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { customLink } from '@wordpress/icons';
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
import type { StatsDefaultModuleProps } from '../types';

const StatClicks: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsClicks';

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
					className={ className }
					title={ translate( 'Clicks' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ customLink }
							description={ translate(
								'Learn about your most {{link}}clicked external links{{/link}} to track engaging content.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#clicks` ) } />,
									},
									context: 'Stats: Info box label when the Clicks module is empty',
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
					path="clicks"
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
