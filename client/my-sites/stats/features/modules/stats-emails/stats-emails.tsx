import { StatsCard } from '@automattic/components';
import { mail } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
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
import { StatsEmptyActionEmail } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import {
	TooltipWrapper,
	OpensTooltipContent,
	ClicksTooltipContent,
	hasUniqueMetrics,
	EmailStatsItem,
} from './tooltips';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsEmails: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	summaryUrl,
}: StatsDefaultModuleProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsEmailsSummary';

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const supportContext = isSiteJetpackNotAtomic ? 'stats-emails-jetpack' : 'stats-emails';

	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	// The period unit is not used in the Email Stats Summary because it always fetches the all-time period.
	// To make the Email Stats module work with the Stats module component and route for Email Stats Summary,
	// we need to force the period to be `day`.
	const forcedDailyPeriodForStatsModule = Object.assign( {}, period, { period: 'day' } );

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
					path="emails"
					titleNodes={
						<StatsInfoArea>
							{ translate( '{{link}}Latest emails sent{{/link}} and their performance.', {
								comment: '{{link}} links to support documentation.',
								components: {
									link: <InlineSupportLink supportContext={ supportContext } showIcon={ false } />,
								},
								context: 'Stats: Header popower information when the Emails module has data.',
							} ) }
						</StatsInfoArea>
					}
					additionalColumns={ {
						header: <span>{ translate( 'Opens' ) }</span>,
						body: ( item: EmailStatsItem ) => {
							const opensUnique = parseInt( String( item.unique_opens ), 10 );
							const opens = parseInt( String( item.opens ), 10 );
							const hasUniques = hasUniqueMetrics( opensUnique, opens );
							return (
								<TooltipWrapper
									value={
										hasUniques
											? `${ formatNumber( item.opens_rate, {
													numberFormatOptions: {
														maximumFractionDigits: 2,
													},
											  } ) }%`
											: '—'
									}
									item={ item }
									TooltipContent={ OpensTooltipContent }
								/>
							);
						},
					} }
					moduleStrings={ moduleStrings }
					period={ forcedDailyPeriodForStatsModule }
					query={ query }
					statType={ statType }
					mainItemLabel={ translate( 'Latest emails' ) }
					metricLabel={ translate( 'Clicks' ) }
					valueField="clicks_rate"
					formatValue={ ( value: number, item: EmailStatsItem ) => {
						if ( ! item?.opens ) {
							return value;
						}
						const clicksUnique = parseInt( String( item.unique_clicks ), 10 );
						const clicks = parseInt( String( item.clicks ), 10 );
						const hasUniques = hasUniqueMetrics( clicksUnique, clicks );
						return (
							<TooltipWrapper
								value={
									hasUniques
										? `${ formatNumber( item.clicks_rate, {
												numberFormatOptions: {
													maximumFractionDigits: 2,
												},
										  } ) }%`
										: '—'
								}
								item={ item }
								TooltipContent={ ClicksTooltipContent }
							/>
						);
					} }
					className={ className }
					hasNoBackground
					skipQuery
				/>
			) }
			{ ! isRequestingData && ! data?.length && ! shouldGateStatsModule && (
				<StatsCard
					className={ className }
					title={ translate( 'Emails' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ mail }
							description={ translate(
								'Your {{link}}latest emails sent{{/link}} will display here to better understand how they performed. Start sending!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
										),
									},
									context: 'Stats: Info box label when the Emails module is empty',
								}
							) }
							cards={ <StatsEmptyActionEmail from="module_emails" /> }
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

export default StatsEmails;
