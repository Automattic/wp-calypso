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
import StatsNavigation from 'client/blocks/stats-navigation';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import AllTime from 'client/my-sites/stats/all-time/';
import Comments from '../stats-comments';
import Reach from '../stats-reach';
import PostingActivity from '../post-trends';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';
import MostPopular from 'client/my-sites/stats/most-popular';
import LatestPostSummary from '../post-performance';
import DomainTip from 'client/my-sites/domain-tip';
import Main from 'client/components/main';
import StatsFirstView from '../stats-first-view';
import SectionHeader from 'client/components/section-header';
import StatsViews from '../stats-views';
import Followers from '../stats-followers';
import JetpackColophon from 'client/components/jetpack-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'client/state/ui/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';

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
			<StatsFirstView />
			<SidebarNavigation />
			<StatsNavigation selectedItem={ 'insights' } siteId={ siteId } slug={ siteSlug } />
			<div>
				<PostingActivity />
				<SectionHeader label={ translate( 'All Time Views' ) } />
				<StatsViews />
				{ siteId && <DomainTip siteId={ siteId } event="stats_insights_domain" /> }
				<div className="stats-insights__nonperiodic has-recent">
					<div className="stats__module-list">
						<div className="stats__module-column">
							<LatestPostSummary />
							<MostPopular />
							{ tagsList }
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

export default flowRight( connectComponent, localize )( StatsInsights );
