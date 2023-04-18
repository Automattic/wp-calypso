import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AnnualHighlightsSection from '../annual-highlights-section';
import Followers from '../stats-followers';
import StatsModuleEmails from '../stats-module-emails';
import Reach from '../stats-reach';
import SubscribersSection from '../subscribers-section';

const StatsSubscribersPage = ( { period } ) => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	// Run-time configuration.
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const showEmailSection = config.isEnabled( 'newsletter/stats' ) && ! isOdysseyStats;

	const statsModuleListClass = classNames(
		'stats__module-list stats__module--unified',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		},
		'subscribers-page'
	);

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
				<SubscribersSection siteId={ siteId } slug={ siteSlug } period={ period } />
				<div className={ statsModuleListClass }>
					<Followers path="followers" />
					<Reach />
					{ showEmailSection && <StatsModuleEmails /> }
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default StatsSubscribersPage;
