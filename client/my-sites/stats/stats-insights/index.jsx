import config from '@automattic/calypso-config';
import classNames from 'classnames';
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
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AllTimelHighlightsSection from '../all-time-highlights-section';
import AllTimeViewsSection from '../all-time-views-section';
import AnnualHighlightsSection from '../annual-highlights-section';
import LatestPostSummary from '../post-performance';
import PostingActivity from '../post-trends';
import Comments from '../stats-comments';
import Followers from '../stats-followers';
import StatsModule from '../stats-module';
import Reach from '../stats-reach';
import StatShares from '../stats-shares';
import statsStrings from '../stats-strings';

const StatsInsights = ( props ) => {
	const { siteId, siteSlug, translate, isOdysseyStats } = props;
	const moduleStrings = statsStrings();
	const isInsightsPageGridEnabled = config.isEnabled( 'stats/insights-page-grid' );

	const statsModuleListClass = classNames( 'stats__module-list stats__module--unified', {
		'is-insights-page-enabled': isInsightsPageGridEnabled,
	} );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'insights' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
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
				<AnnualHighlightsSection siteId={ siteId } />
				<AllTimelHighlightsSection siteId={ siteId } />
				<PostingActivity siteId={ siteId } />
				<AllTimeViewsSection siteId={ siteId } slug={ siteSlug } />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_insights_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				{ isInsightsPageGridEnabled ? (
					<div className={ statsModuleListClass }>
						<StatsModule
							path="tags-categories"
							moduleStrings={ moduleStrings.tags }
							statType="statsTags"
							hideSummaryLink
							hideNewModule // remove when cleaning 'stats/horizontal-bars-everywhere' FF
						/>
						<Comments path="comments" />

						{ /** TODO: The feature depends on Jetpack Sharing module and is disabled for Odyssey for now. */ }
						{ ! isOdysseyStats && <StatShares siteId={ siteId } /> }

						<Followers path="followers" />
						<StatsModule
							path="publicize"
							moduleStrings={ moduleStrings.publicize }
							statType="statsPublicize"
							hideSummaryLink
							hideNewModule // remove when cleaning 'stats/horizontal-bars-everywhere' FF
						/>

						<LatestPostSummary />
						<Reach />
					</div>
				) : (
					// remove all this section when cleaning 'stats/insights-page-grid'
					<div className="stats-insights__nonperiodic has-recent">
						<div className={ statsModuleListClass }>
							<div className="stats__module-column">
								<LatestPostSummary />

								<StatsModule
									path="tags-categories"
									moduleStrings={ moduleStrings.tags }
									statType="statsTags"
									hideSummaryLink
									hideNewModule // remove when cleaning 'stats/horizontal-bars-everywhere' FF
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
									hideSummaryLink
									hideNewModule // remove when cleaning 'stats/horizontal-bars-everywhere' FF
								/>
							</div>
						</div>
					</div>
				) }
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
