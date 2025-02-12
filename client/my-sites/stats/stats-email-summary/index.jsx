import { localize, numberFormat } from 'i18n-calypso';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	TooltipWrapper,
	OpensTooltipContent,
	ClicksTooltipContent,
} from '../features/modules/stats-emails/tooltips';
import StatsModule from '../stats-module';
import PageViewTracker from '../stats-page-view-tracker';
import statsStringsFactory from '../stats-strings';
import '../summary/style.scss';
import '../stats-module/summary-nav.scss';

const StatsStrings = statsStringsFactory();

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
											? `${ numberFormat( item.opens_rate, {
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
											? `${ numberFormat( item.clicks_rate, {
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
