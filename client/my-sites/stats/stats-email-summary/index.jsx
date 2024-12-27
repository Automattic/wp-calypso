import { Tooltip } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsModule from '../stats-module';
import PageViewTracker from '../stats-page-view-tracker';
import statsStringsFactory from '../stats-strings';
import '../summary/style.scss';
import '../stats-module/summary-nav.scss';

const StatsStrings = statsStringsFactory();

const TooltipWrapper = ( { value, item, renderContent } ) => {
	const triggerRef = useRef( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	return (
		<span className="stats-email__tooltip-wrapper">
			<span
				ref={ triggerRef }
				className="stats-email__tooltip-trigger"
				onMouseEnter={ () => setShowTooltip( true ) }
				onMouseLeave={ () => setShowTooltip( false ) }
			>
				{ value }
			</span>
			<Tooltip position="top" context={ triggerRef.current } isVisible={ showTooltip }>
				{ renderContent( item ) }
			</Tooltip>
		</span>
	);
};

const StatsEmailSummary = ( { translate, period, siteSlug } ) => {
	// Navigation settings. One of the following, depending on the summary view.
	// Traffic => /stats/day/
	// Insights => /stats/insights/
	const localizedTabNames = {
		traffic: translate( 'Traffic' ),
		insights: translate( 'Insights' ),
	};
	const backLabel = localizedTabNames.traffic;
	let backLink = `/stats/day/`;

	const query = {
		period: period,
		quantity: 30,
	};
	const module = 'emails';
	const title = translate( 'Emails' );

	const domain = siteSlug;
	if ( domain?.length > 0 ) {
		backLink += domain;
	}
	const navigationItems = [ { label: backLabel, href: backLink }, { label: title } ];

	const renderOpensTooltipContent = ( item ) => {
		const opensUnique = parseInt( item.unique_opens, 10 );
		const opens = parseInt( item.opens, 10 );
		const opensRate = parseFloat( item.opens_rate );
		const totalSends = parseInt( item.total_sends, 10 );
		const hasUniquesData = opensUnique > 0 && opens > 0;

		return (
			<div className="stats-email__tooltip">
				<div>
					{ translate( 'Subscribers reached: %(sends)d', {
						args: { sends: totalSends },
					} ) }
				</div>
				<div>
					{ translate( 'Total opens: %(opens)d', {
						args: { opens },
					} ) }
				</div>
				<div>
					{ hasUniquesData
						? translate( 'Unique opens: %(uniqueOpens)d (%(openRate).2f%%)', {
								args: { uniqueOpens: opensUnique, openRate: opensRate },
						  } )
						: translate( 'Unique opens: n/a' ) }
				</div>
			</div>
		);
	};

	const renderClicksTooltipContent = ( item ) => {
		const clicksUnique = parseInt( item.unique_clicks, 10 );
		const clicks = parseInt( item.clicks, 10 );
		const clicksRate = parseFloat( item.clicks_rate );
		const totalSends = parseInt( item.total_sends, 10 );
		const hasUniquesData = clicksUnique > 0 && clicks > 0;

		return (
			<div className="stats-email__tooltip">
				<div>
					{ translate( 'Subscribers reached: %(sends)d', {
						args: { sends: totalSends },
					} ) }
				</div>
				<div>
					{ translate( 'Total clicks: %(clicks)d', {
						args: { clicks },
					} ) }
				</div>
				<div>
					{ hasUniquesData
						? translate( 'Unique clicks: %(uniqueClicks)d (%(clickRate).2f%%)', {
								args: { uniqueClicks: clicksUnique, clickRate: clicksRate },
						  } )
						: translate( 'Unique clicks: n/a' ) }
				</div>
			</div>
		);
	};

	return (
		<Main className="has-fixed-nav" wideLayout>
			<PageViewTracker
				path={ `/stats/${ module }/:site` }
				title={ `Stats > ${ titlecase( module ) }` }
			/>
			<NavigationHeader className="stats-summary-view" navigationItems={ navigationItems } />

			<div id="my-stats-content" className="stats-summary-view stats-summary__positioned">
				<div className="stats-summary-nav">
					<div className="stats-summary-nav__header">
						<div>
							<div className="stats-section-title">
								<h3>{ translate( 'Stats for Emails' ) }</h3>
							</div>
						</div>
					</div>
				</div>

				<StatsModule
					additionalColumns={ {
						header: (
							<>
								<span>{ translate( 'Opens' ) }</span>
							</>
						),
						body: ( item ) => {
							const opensUnique = parseInt( item.unique_opens, 10 );
							const opens = parseInt( item.opens, 10 );
							const hasUniquesData = opensUnique > 0 || opens === 0;
							return (
								<TooltipWrapper
									value={
										hasUniquesData
											? `${ item.opens_rate }%`
											: translate(
													/* translators: Shown in a table column when email open rate data is not available */
													'n/a'
											  )
									}
									item={ item }
									renderContent={ renderOpensTooltipContent }
								/>
							);
						},
					} }
					path="emails"
					moduleStrings={ { ...StatsStrings.emails, title: '' } }
					period={ period }
					query={ query }
					statType="statsEmailsSummary"
					mainItemLabel={ translate( 'Latest Emails' ) }
					hideSummaryLink
					metricLabel={ translate( 'Clicks' ) }
					valueField="clicks_rate"
					formatValue={ ( value, item ) => {
						if ( item?.clicks !== undefined ) {
							const clicksUnique = parseInt( item.unique_clicks, 10 );
							const clicks = parseInt( item.clicks, 10 );
							const hasUniquesData = clicksUnique > 0 || clicks === 0;
							return (
								<TooltipWrapper
									value={
										hasUniquesData
											? `${ item.clicks_rate }%`
											: translate(
													/* translators: Shown in a table column when email click rate data is not available */
													'n/a'
											  )
									}
									item={ item }
									renderContent={ renderClicksTooltipContent }
								/>
							);
						}
						return <span>{ value }</span>;
					} }
					listItemClassName="stats__summary--narrow-mobile"
				/>
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} )( localize( StatsEmailSummary ) );
