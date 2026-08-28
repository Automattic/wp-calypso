import { StatsCard } from '@automattic/components';
import { mail } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
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
import { isRateKnown, toCount } from './is-rate-known';
import {
	TooltipWrapper,
	OpensTooltipContent,
	ClicksTooltipContent,
	EmailStatsItem,
} from './tooltips';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';
import './style.scss';

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
						header: (
							<>
								<span>{ translate( 'Opens' ) }</span>
								<span>{ translate( 'Open rate' ) }</span>
								<span>{ translate( 'Clicks' ) }</span>
							</>
						),
						body: ( item: EmailStatsItem ) => {
							const opens = toCount( item.opens );
							const rateKnown = isRateKnown( {
								uniques: toCount( item.unique_opens ),
								totals: opens,
								sends: toCount( item.total_sends ),
							} );
							return (
								<>
									<span>{ formatNumber( opens ) }</span>
									<span>
										<TooltipWrapper
											value={
												rateKnown
													? `${ formatNumber( item.opens_rate ?? 0, {
															numberFormatOptions: {
																maximumFractionDigits: 2,
															},
													  } ) }%`
													: '—'
											}
											item={ item }
											TooltipContent={ OpensTooltipContent }
										/>
									</span>
									<span>{ formatNumber( toCount( item.clicks ) ) }</span>
								</>
							);
						},
					} }
					moduleStrings={ moduleStrings }
					period={ forcedDailyPeriodForStatsModule }
					query={ query }
					statType={ statType }
					mainItemLabel={ translate( 'Latest emails' ) }
					metricLabel={ translate( 'Click rate' ) }
					valueField="clicks_rate"
					formatValue={ ( value: number, item: EmailStatsItem ) => {
						if ( ! item ) {
							return value;
						}
						const rateKnown = isRateKnown( {
							uniques: toCount( item.unique_clicks ),
							totals: toCount( item.clicks ),
							sends: toCount( item.total_sends ),
						} );
						return (
							<TooltipWrapper
								value={
									rateKnown
										? `${ formatNumber( item.clicks_rate ?? 0, {
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
					className={ clsx( className, 'stats-emails--four-columns' ) }
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
