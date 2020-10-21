/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import AllTime from 'calypso/my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Reach from '../stats-reach';
import PostingActivity from '../post-trends';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'calypso/my-sites/stats/most-popular';
import LatestPostSummary from '../post-performance';
import DomainTip from 'calypso/blocks/domain-tip';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SectionHeader from 'calypso/components/section-header';
import StatsViews from '../stats-views';
import Followers from '../stats-followers';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import AnnualSiteStats from 'calypso/my-sites/stats/annual-site-stats';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';

const StatsInsights = ( props ) => {
	const { followList, isJetpack, siteId, siteSlug, translate } = props;
	const moduleStrings = statsStrings();

	let tagsList;
	if ( ! isJetpack ) {
		tagsList = (
			<StatsModule
				path="tags-categories"
				moduleStrings={ moduleStrings.tags }
				statType="statsTags"
			/>
		);
	}

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main wideLayout>
			<DocumentHead title={ translate( 'Stats and Insights' ) } />
			<PageViewTracker path="/stats/insights/:site" title="Stats > Insights" />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="stats__section-header"
				headerText={ translate( 'Stats and Insights' ) }
				align="left"
			/>
			<StatsNavigation selectedItem={ 'insights' } siteId={ siteId } slug={ siteSlug } />
			<div>
				<PostingActivity />
				<SectionHeader label={ translate( 'All-time views' ) } />
				<StatsViews />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_insights_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				<div className="stats-insights__nonperiodic has-recent">
					<div className="stats__module-list">
						<div className="stats__module-column">
							<LatestPostSummary />
							<MostPopular />
							{ tagsList }
							<AnnualSiteStats isWidget />
						</div>
						<div className="stats__module-column">
							<Reach />
							<Followers path={ 'followers' } followList={ followList } />
						</div>
						<div className="stats__module-column">
							<AllTime />
							<Comments path={ 'comments' } followList={ followList } />
							<StatsModule
								path="publicize"
								moduleStrings={ moduleStrings.publicize }
								statType="statsPublicize"
							/>
						</div>
					</div>
				</div>
			</div>
			<JetpackColophon />
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

StatsInsights.propTypes = {
	followList: PropTypes.object.isRequired,
	translate: PropTypes.func,
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} );

export default flowRight( connectComponent, localize )( StatsInsights );
