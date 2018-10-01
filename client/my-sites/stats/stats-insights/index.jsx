/** @format */

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
import DocumentHead from 'components/data/document-head';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AllTime from 'my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Reach from '../stats-reach';
import PostingActivity from '../post-trends';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'my-sites/stats/most-popular';
import LatestPostSummary from '../post-performance';
import DomainTip from 'my-sites/domain-tip';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { abtest } from 'lib/abtest';
import StatsFirstView from '../stats-first-view';
import SectionHeader from 'components/section-header';
import StatsViews from '../stats-views';
import Followers from '../stats-followers';
import JetpackColophon from 'components/jetpack-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import AnnualSiteStats from 'my-sites/stats/annual-site-stats';

const StatsInsights = props => {
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
			<DocumentHead title={ translate( 'Stats' ) } />
			<PageViewTracker path="/stats/insights/:site" title="Stats > Insights" />
			<StatsFirstView />
			<SidebarNavigation />
			<StatsNavigation selectedItem={ 'insights' } siteId={ siteId } slug={ siteSlug } />
			<div>
				<PostingActivity />
				<SectionHeader label={ translate( 'All Time Views' ) } />
				<StatsViews />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_insights_domain"
						vendor={ abtest( 'domainManagementSuggestionV2' ) }
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
	moment: PropTypes.func,
	translate: PropTypes.func,
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} );

export default flowRight(
	connectComponent,
	localize
)( StatsInsights );
