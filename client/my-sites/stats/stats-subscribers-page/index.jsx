import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AnnualHighlightsSection from '../annual-highlights-section';
import Followers from '../stats-followers';
import Reach from '../stats-reach';

const StatsSubscribersPage = ( props ) => {
	const { siteId, siteSlug, translate, isOdysseyStats, isJetpack } = props;

	// TODO - use new FF
	const isInsightsPageGridEnabled = config.isEnabled( 'stats/insights-page-grid' );

	const statsModuleListClass = classNames( 'stats__module-list stats__module--unified', {
		'is-insights-page-enabled': isInsightsPageGridEnabled,
		'is-odyssey-stats': isOdysseyStats,
		'is-jetpack': isJetpack,
	} );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/subscribers/:site" title="Stats > Subscribers" />
			<div className="stats">
				<FormattedHeader
					brandFont
					className="stats__section-header modernized-header"
					headerText={ translate( 'Jetpack Stats' ) }
					subHeaderText={ translate( "View your site's performance and learn from trends." ) }
					align="left"
				/>
				<StatsNavigation selectedItem="subscribers" siteId={ siteId } slug={ siteSlug } />
				{ /* TODO: replace annual highlight */ }
				<AnnualHighlightsSection siteId={ siteId } />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_subscribers_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				{ config.isEnabled( 'stats/subscribers-section' ) && (
					<AsyncLoad require="calypso/my-sites/stats/subscribers-section" siteId={ siteId } />
				) }
				<div className={ statsModuleListClass }>
					<Followers path="followers" />
					<Reach />
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

StatsSubscribersPage.propTypes = {
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

export default flowRight( connectComponent, localize )( StatsSubscribersPage );
