import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Followers from '../stats-followers';
import StatsModuleEmails from '../stats-module-emails';
import StatsPageHeader from '../stats-page-header';
import Reach from '../stats-reach';
import SubscribersChartSection, { PeriodType } from '../stats-subscribers-chart-section';
import SubscribersOverview from '../stats-subscribers-overview';
import SubscribersSection from '../subscribers-section';
import SubscribersHighlightSection from './subscribers-highlight-section';

interface StatsSubscribersPageProps {
	period: PeriodType;
}

const StatsSubscribersPage = ( { period }: StatsSubscribersPageProps ) => {
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
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/subscribers/:site" title="Stats > Subscribers" />
			<div className="stats">
				<StatsPageHeader
					page="subscribers"
					subHeaderText={ translate( "View your site's performance and learn from trends." ) }
				/>
				<StatsNavigation selectedItem="subscribers" siteId={ siteId } slug={ siteSlug } />
				<SubscribersHighlightSection />
				{ siteId && (
					<DomainTip
						siteId={ siteId }
						event="stats_subscribers_domain"
						vendor={ getSuggestionsVendor() }
					/>
				) }
				<SubscribersSection siteId={ siteId } slug={ siteSlug } period={ period } />
				<SubscribersOverview siteId={ siteId } />
				<div className={ statsModuleListClass }>
					<Followers path="followers" />
					<Reach />
					{ showEmailSection && <StatsModuleEmails /> }
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsSubscribersPage;
