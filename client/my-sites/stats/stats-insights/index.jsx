import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import moment from 'moment';
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
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AllTimelHighlightsSection from '../all-time-highlights-section';
import AnnualHighlightsSection from '../annual-highlights-section';
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
	const { siteId, siteSlug, translate, isOdysseyStats, date } = props;
	const moduleStrings = statsStrings();

	const isNewMainChart = config.isEnabled( 'stats/new-main-chart' );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'insights' );

	const currentYear = parseInt( moment.utc().format( 'YYYY' ), 10 );
	const queryYear = parseInt( date.format( 'YYYY' ), 10 );
	const isPrevArrowHidden = ( queryDate ) => {
		return moment( queryDate ).isSameOrBefore( '2001-01-01' );
	};

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main className={ isNewMainChart ? 'stats--new-wrapper' : undefined } fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/insights/:site" title="Stats > Insights" />
			<div className="stats">
				<FormattedHeader
					brandFont
					className="stats__section-header modernized-header"
					headerText={ translate( 'Jetpack Stats' ) }
					subHeaderText={ translate( "View your site's performance and learn from trends." ) }
					align="left"
				/>
				<StatsNavigation selectedItem="insights" siteId={ siteId } slug={ siteSlug } />
				<AnnualHighlightsSection
					siteId={ siteId }
					queryDate={ date }
					hidePreviousArrow={ isPrevArrowHidden( date ) }
					hideNextArrow={ currentYear <= queryYear }
					url={ `/stats/insights/${ siteSlug }` }
				/>
				<AllTimelHighlightsSection siteId={ siteId } />
				<div className="stats__module--insights-unified">
					<PostingActivity />
					<SectionHeader label={ translate( 'All-time views' ) } />
					<StatsViews />
				</div>
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_insights_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				<div className="stats-insights__nonperiodic has-recent">
					<div className="stats__module-list stats__module--unified">
						<div className="stats__module-column">
							<LatestPostSummary />

							<StatsModule
								path="tags-categories"
								moduleStrings={ moduleStrings.tags }
								statType="statsTags"
							/>
							{ /** TODO: The feature depends on Jetpack Sharing module and is disabled for Odyssey for now. */ }
							{ ! isOdysseyStats && <StatShares siteId={ siteId } /> }
						</div>
						<div className="stats__module-column">
							<Reach />
							<Followers path="followers" />
						</div>
						<div className="stats__module-column">
							<Comments path="comments" />
							<StatsModule
								path="publicize"
								moduleStrings={ moduleStrings.publicize }
								statType="statsPublicize"
							/>
						</div>
					</div>
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

StatsInsights.propTypes = {
	translate: PropTypes.func,
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
		isOdysseyStats,
	};
} );

export default flowRight( connectComponent, localize )( StatsInsights );
