import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsModule from '../stats-module';
import statsStringsFactory from '../stats-strings';

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

	// Set up for FixedNavigationHeader.
	const domain = siteSlug;
	if ( domain?.length > 0 ) {
		backLink += domain;
	}
	const navigationItems = [ { label: backLabel, href: backLink }, { label: title } ];

	const isHorizontalBarComponentEnabledEverywhere = config.isEnabled(
		'stats/horizontal-bars-everywhere'
	);

	const cardParentClassName = classNames( 'stats-summary-view', {
		'stats-summary__positioned': isHorizontalBarComponentEnabledEverywhere,
	} );
	return (
		<Main className="has-fixed-nav" wideLayout>
			<PageViewTracker
				path={ `/stats/${ module }/:site` }
				title={ `Stats > ${ titlecase( module ) }` }
			/>
			<FixedNavigationHeader navigationItems={ navigationItems } />

			<div id="my-stats-content" className={ cardParentClassName }>
				<div className="stats-summary-nav__header">
					<div>
						<div className="stats-section-title">
							<h3>{ translate( 'Stats for Emails' ) }</h3>
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
						body: ( item ) => (
							<>
								<span>{ item.opens }</span>
							</>
						),
					} }
					path="emails"
					moduleStrings={ { ...StatsStrings.emails, title: '' } }
					period={ period }
					query={ query }
					statType="statsEmailsSummary"
					mainItemLabel={ translate( 'Latest Emails' ) }
					hideSummaryLink
					metricLabel={ translate( 'Clicks' ) }
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
