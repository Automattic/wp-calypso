/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LatestPostSummary from '../post-performance';
import PostingActivity from '../post-trends';
import Comments from '../stats-comments';
import StatsFirstView from '../stats-first-view';
import Followers from '../stats-followers';
import StatsModule from '../stats-module';
import StatsNavigation from '../stats-navigation';
import Reach from '../stats-reach';
import statsStrings from '../stats-strings';
import StatsViews from '../stats-views';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import DomainTip from 'my-sites/domain-tip';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AllTime from 'my-sites/stats/all-time/';
import MostPopular from 'my-sites/stats/most-popular';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const StatsInsights = ( props ) => {
	const { followList, isJetpack, siteId, siteSlug, translate } = props;
	const moduleStrings = statsStrings();

	let tagsList;
	if ( ! isJetpack ) {
		tagsList = (
			<StatsModule
				path="tags-categories"
				moduleStrings={ moduleStrings.tags }
				statType="statsTags" />
		);
	}

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main wideLayout>
			<StatsFirstView />
			<SidebarNavigation />
			<StatsNavigation
				siteId={ siteId }
				section="insights"
				slug={ siteSlug }
			/>
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
							<Followers
								path={ 'followers' }
								followList={ followList } />
						</div>
						<div className="stats__module-column">
							<AllTime />
							<Comments
								path={ 'comments' }
								followList={ followList }
							/>
							<StatsModule
								path="publicize"
								moduleStrings={ moduleStrings.publicize }
								statType="statsPublicize" />
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

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			isJetpack: isJetpackSite( state, siteId ),
			siteId,
			siteSlug: getSelectedSiteSlug( state, siteId ),
		};
	}
);

export default flowRight(
	connectComponent,
	localize,
)( StatsInsights );
