import { StatsCard } from '@automattic/components';
import { mail } from '@automattic/components/src/icons';
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
import StatsEmptyActionEmail from '../shared/stats-empty-action-email';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatEmails: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
}: StatsDefaultModuleProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsEmailsSummary';

	const requesting = useSelector( ( state: StatsStateProps ) =>
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
			{ ! data?.length ? (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) }
					title={ translate( 'Emails' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ mail }
							description={ translate(
								'Learn about your {{link}}latest emails sent{{/link}} to better understand how they performed. Start sending!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#emails` ) } />,
									},
									context: 'Stats: Info box label when the Emails module is empty',
								}
							) }
							cards={ <StatsEmptyActionEmail from="module_emails" /> }
						/>
					}
				/>
			) : (
				<StatsModule
					additionalColumns={ {
						header: (
							<>
								<span>{ translate( 'Opens' ) }</span>
							</>
						),
						body: ( item: { opens: number } ) => (
							<>
								<span>{ item.opens }</span>
							</>
						),
					} }
					path="emails"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType="statsEmailsSummary"
					mainItemLabel={ translate( 'Latest Emails' ) }
					metricLabel={ translate( 'Clicks' ) }
					showSummaryLink
					className={ className }
					hasNoBackground
				/>
			) }
		</>
	);
};

export default StatEmails;
