import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import AllTime from 'calypso/my-sites/stats/all-time/';
import AnnualSiteStats from 'calypso/my-sites/stats/annual-site-stats';
import MostPopular from 'calypso/my-sites/stats/most-popular';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import LatestPostSummary from '../post-performance';
import PostingActivity from '../post-trends';
import Comments from '../stats-comments';
import Followers from '../stats-followers';
import StatsModule from '../stats-module';
import Reach from '../stats-reach';
import StatShares from '../stats-shares';
import statsStrings from '../stats-strings';
import StatsViews from '../stats-views';

const StatsInsights = ( props ) => {
	const { isJetpack, siteId, siteSlug, translate } = props;
	const moduleStrings = statsStrings();

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
				subHeaderText={ translate( "View your site's performance and learn from trends." ) }
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
							{ ! isJetpack && (
								<StatsModule
									path="tags-categories"
									moduleStrings={ moduleStrings.tags }
									statType="statsTags"
								/>
							) }
							<AnnualSiteStats isWidget />
							{ ! isJetpack && <StatShares siteId={ siteId } /> }
						</div>
						<div className="stats__module-column">
							<Reach />
							<Followers path={ 'followers' } />
						</div>
						<div className="stats__module-column">
							<AllTime />
							<Comments path={ 'comments' } />
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
