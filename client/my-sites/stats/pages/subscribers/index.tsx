import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteSlug, isSimpleSite } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useSubscribersTotalsQueries from '../../hooks/use-subscribers-totals-query';
import Followers from '../../stats-followers';
import StatsModulePlaceholder from '../../stats-module/placeholder';
import StatsModuleEmails from '../../stats-module-emails';
import PageViewTracker from '../../stats-page-view-tracker';
import SubscribersChartSection, { PeriodType } from '../../stats-subscribers-chart-section';
import SubscribersHighlightSection from '../../stats-subscribers-highlight-section';
import SubscribersOverview from '../../stats-subscribers-overview';
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
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const { supportsEmailStats, supportsSubscriberChart } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);
	const today = new Date().toISOString().slice( 0, 10 );

	const statsModuleListClass = clsx(
		'stats__module-list stats__module--unified',
		'stats__module-list',
		'stats__flexible-grid-container',
		{
			'is-email-stats-unavailable': ! supportsEmailStats,
			'is-jetpack': isJetpack,
		},
		'subscribers-page'
	);

	// TODO: Pass subscribersTotals as props to SubscribersHighlightSection to avoid duplicate queries.
	const { data: subscribersTotals, isLoading } = useSubscribersTotalsQueries( siteId );
	const isSimple = useSelector( isSimpleSite );
	const hasNoSubscriberOtherThanAdmin =
		! subscribersTotals?.total ||
		( subscribersTotals?.total === 1 && subscribersTotals?.is_owner_subscribing );
	const showLaunchpad = ! isLoading && hasNoSubscriberOtherThanAdmin;

	const emptyComponent = isSimple ? (
		<SubscriberLaunchpad launchpadContext="subscriber-stats" />
	) : (
		<EmptyListView />
	);

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	// Check if the site has any paid subscription products added.
	const products = useSelector( ( state ) => state.memberships?.productList?.items[ siteId ?? 0 ] );
	// Odyssey Stats doesn't support the membership API endpoint yet.
	// Products with an `undefined` value rather than an empty array means the API call has not been completed yet.
	const hasAddedPaidSubscriptionProduct = ! isOdysseyStats && products && products.length > 0;

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/subscribers/:site" title="Stats > Subscribers" />
			<div className="stats">
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate( 'Track your subscriber growth and engagement.' ) }
					screenReader={ navItems.subscribers?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="subscribers" siteId={ siteId } slug={ siteSlug } />
				{ isLoading && <StatsModulePlaceholder className="is-subscriber-page" isLoading /> }
				{ ! isLoading &&
					( showLaunchpad ? (
						emptyComponent
					) : (
						<>
							<SubscribersHighlightSection siteId={ siteId } />
							{ supportsSubscriberChart && (
								<>
									<SubscribersChartSection
										siteId={ siteId }
										slug={ siteSlug }
										period={ period.period }
									/>
									{ hasAddedPaidSubscriptionProduct && <SubscribersOverview siteId={ siteId } /> }
								</>
							) }
							<div className={ statsModuleListClass }>
								<Followers
									path="followers"
									className={ clsx(
										{
											'stats__flexible-grid-item--half': supportsEmailStats,
											'stats__flexible-grid-item--full': ! supportsEmailStats,
										},
										'stats__flexible-grid-item--full--large'
									) }
								/>
								{ supportsEmailStats && period && (
									<StatsModuleEmails
										period={ period }
										query={ { period, date: today } }
										className={ clsx(
											'stats__flexible-grid-item--half',
											'stats__flexible-grid-item--full--large'
										) }
									/>
								) }
							</div>
						</>
					) ) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsSubscribersPage;
