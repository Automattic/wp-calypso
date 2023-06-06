import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AllTimelHighlightsSection from '../all-time-highlights-section';
import AllTimeViewsSection from '../all-time-views-section';
import AnnualHighlightsSection from '../annual-highlights-section';
import PostingActivity from '../post-trends';
import Comments from '../stats-comments';
import Followers from '../stats-followers';
import StatsModule from '../stats-module';
import StatsPageHeader from '../stats-page-header';
import PageViewTracker from '../stats-page-view-tracker';
import Reach from '../stats-reach';
import StatShares from '../stats-shares';
import statsStrings from '../stats-strings';

const StatsInsights = ( props ) => {
	const { siteId, siteSlug, translate, isOdysseyStats, isJetpack } = props;
	const moduleStrings = statsStrings();

	const statsModuleListClass = classNames(
		'stats__module-list--insights',
		'stats__module--unified',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		}
	);

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
				<StatsPageHeader
					page="insights"
					subHeaderText={ translate( "View your site's performance and learn from trends." ) }
				/>
				<StatsNavigation selectedItem="insights" siteId={ siteId } slug={ siteSlug } />
				<AnnualHighlightsSection siteId={ siteId } />
				<AllTimelHighlightsSection siteId={ siteId } siteSlug={ siteSlug } />
				<PostingActivity siteId={ siteId } />
				<AllTimeViewsSection siteId={ siteId } slug={ siteSlug } />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_insights_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				<div className={ statsModuleListClass }>
					<StatsModule
						path="tags-categories"
						moduleStrings={ moduleStrings.tags }
						statType="statsTags"
						hideSummaryLink
					/>
					<Comments path="comments" />

					{ /** TODO: The feature depends on Jetpack Sharing module and is disabled for all Jetpack Sites for now. */ }
					{ ! isJetpack && <StatShares siteId={ siteId } /> }

					<Followers path="followers" />
					<Reach />
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
		isJetpack: isJetpackSite( state, siteId ),
	};
} );

export default flowRight( connectComponent, localize )( StatsInsights );
