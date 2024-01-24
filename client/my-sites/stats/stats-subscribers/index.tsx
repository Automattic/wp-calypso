import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import version_compare from 'calypso/lib/version-compare';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import {
	isJetpackSite,
	getSiteSlug,
	getJetpackStatsAdminVersion,
	isSimpleSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import Followers from '../stats-followers';
import StatsModuleEmails from '../stats-module-emails';
import PageViewTracker from '../stats-page-view-tracker';
import Reach from '../stats-reach';
import SubscribersChartSection, { PeriodType } from '../stats-subscribers-chart-section';
import SubscribersHighlightSection from '../stats-subscribers-highlight-section';
import SubscribersOverview from '../stats-subscribers-overview';
import type { Moment } from 'moment';

interface StatsSubscribersPageProps {
	period: {
		// Subscribers page only use this period but other properties and this format is needed for StatsModule to construct a URL to email's summary page
		period: PeriodType;
		key: string;
		startOf: Moment;
		endOf: Moment;
	};
}

const StatsSubscribersPage = ( { period }: StatsSubscribersPageProps ) => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	// Run-time configuration.
	const statsAdminVersion = useSelector( ( state ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	// Always show chart for Calypso, and check compatibility for Odyssey.
	const isChartVisible =
		! isOdysseyStats ||
		( statsAdminVersion && version_compare( statsAdminVersion, '0.11.0-alpha', '>=' ) );

	const today = new Date().toISOString().slice( 0, 10 );

	const statsModuleListClass = classNames(
		'stats__module-list stats__module--unified',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		},
		'subscribers-page'
	);

	const { data: subscribersTotals, isLoading } = useSubscribersTotalsQueries( siteId );
	const isSimple = useSelector( isSimpleSite );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const showLaunchpad = ! isLoading && ( isSimple || isAtomic ) && ! subscribersTotals?.total;

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/subscribers/:site" title="Stats > Subscribers" />
			<div className="stats">
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate( "View your site's performance and learn from trends." ) }
					screenReader={ navItems.subscribers?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="subscribers" siteId={ siteId } slug={ siteSlug } />
				{ showLaunchpad ? (
					<SubscriberLaunchpad launchpadContext="subscriber-stats" />
				) : (
					<>
						<SubscribersHighlightSection siteId={ siteId } />
						{ isChartVisible && (
							<>
								<SubscribersChartSection
									siteId={ siteId }
									slug={ siteSlug }
									period={ period.period }
								/>
								<SubscribersOverview siteId={ siteId } />
							</>
						) }
						<div className={ statsModuleListClass }>
							<Followers path="followers" />
							<Reach />
							{ ! isOdysseyStats && period && (
								<StatsModuleEmails period={ period } query={ { period, date: today } } />
							) }
						</div>
					</>
				) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsSubscribersPage;
