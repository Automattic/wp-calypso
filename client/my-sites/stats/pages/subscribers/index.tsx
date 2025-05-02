import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import NavigationHeader from 'calypso/components/navigation-header';
import PageHeader from 'calypso/my-sites/stats/components/headers/page-header';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import StatsModuleEmails from 'calypso/my-sites/stats/features/modules/stats-emails';
import statsStrings from 'calypso/my-sites/stats/stats-strings';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSelector } from 'calypso/state';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSiteSlug, isSimpleSite } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useSubscribersTotalsQueries from '../../hooks/use-subscribers-totals-query';
import Followers from '../../stats-followers';
import StatsModulePlaceholder from '../../stats-module/placeholder';
import PageViewTracker from '../../stats-page-view-tracker';
import SubscribersChartSection, { PeriodType } from '../../stats-subscribers-chart-section';
import SubscribersHighlightSection from '../../stats-subscribers-highlight-section';
import StatsModuleListing from '../shared/stats-module-listing';
import type { Moment } from 'moment';

function StatsSubscribersPageError() {
	const translate = useTranslate();
	const classes = clsx( 'stats-module__placeholder', 'is-void' );

	return (
		<div className={ classes }>
			<p>
				{ translate(
					'An error occurred while loading your subscriber stats. If you continue to have issues loading this page, please get in touch via our {{link}}contact form{{/link}} for assistance.',
					{
						components: {
							link: (
								<a target="_blank" rel="noreferrer" href="https://jetpack.com/contact-support/" />
							),
						},
					}
				) }
			</p>
		</div>
	);
}

interface StatsSubscribersPageProps {
	period: {
		// Subscribers page only use this period but other properties and this format is needed for StatsModule to construct a URL to email's summary page
		period: PeriodType;
		key: string;
		startOf: Moment;
		endOf: Moment;
	};
}

type TranslationStringType = {
	title: string;
	item: string;
	value: string;
	empty: string;
};

const StatsSubscribersPage = ( { period }: StatsSubscribersPageProps ) => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const { supportsEmailStats, supportsSubscriberChart } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);
	const today = new Date().toISOString().slice( 0, 10 );
	const moduleStrings = statsStrings().emails as TranslationStringType;
	const isStatsNavigationImprovementEnabled = config.isEnabled( 'stats/navigation-improvement' );

	const className = clsx( 'subscribers-page', {
		'is-email-stats-unavailable': ! supportsEmailStats,
	} );

	// TODO: Pass subscribersTotals as props to SubscribersHighlightSection to avoid duplicate queries.
	const { data: subscribersTotals, isLoading, isError } = useSubscribersTotalsQueries( siteId );
	const isSimple = useSelector( isSimpleSite );
	const hasNoSubscriberOtherThanAdmin =
		! subscribersTotals?.total ||
		( subscribersTotals?.total === 1 && subscribersTotals?.is_owner_subscribed );
	const showLaunchpad = ! isLoading && hasNoSubscriberOtherThanAdmin;

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	const summaryUrl = `/stats/${ period?.period }/emails/${ siteSlug }?startDate=${ period?.startOf?.format(
		'YYYY-MM-DD'
	) }`;

	const isWPAdmin = config.isEnabled( 'is_odyssey' );
	const subscribersPageClasses = clsx( 'stats', { 'is-odyssey-stats': isWPAdmin } );

	const emptyComponent =
		isSimple && ! isWPAdmin ? (
			<SubscriberLaunchpad launchpadContext="subscriber-stats" />
		) : (
			<EmptyListView />
		);

	// If the subscriptions module is inactive, redirect to the stats page.
	const isSubscriptionsModuleActive = useSelector( ( state ) =>
		siteId ? isJetpackModuleActive( state, siteId, 'subscriptions', true ) : false
	);

	if ( ! isSimple && ! isSubscriptionsModuleActive ) {
		page.redirect( `/stats/day/${ siteSlug }` );
		return;
	}

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<PageViewTracker path="/stats/subscribers/:site" title="Stats > Subscribers" />
			<div className={ subscribersPageClasses }>
				{ ! isStatsNavigationImprovementEnabled ? (
					<NavigationHeader
						className="stats__section-header modernized-header"
						title={ STATS_PRODUCT_NAME }
						subtitle={ translate( 'Track your subscriber growth and engagement.' ) }
						screenReader={ navItems.subscribers?.label }
						navigationItems={ [] }
					></NavigationHeader>
				) : (
					<PageHeader />
				) }
				<StatsNavigation selectedItem="subscribers" siteId={ siteId } slug={ siteSlug } />
				{ isLoading && <StatsModulePlaceholder className="is-subscriber-page" isLoading /> }
				{ isError && <StatsSubscribersPageError /> }
				{ ! isLoading &&
					! isError &&
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
								</>
							) }
							<StatsModuleListing className={ className } siteId={ siteId }>
								<Followers
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
										moduleStrings={ moduleStrings }
										query={ { period: period?.period, date: today } }
										summaryUrl={ summaryUrl }
										className={ clsx(
											'stats__flexible-grid-item--half',
											'stats__flexible-grid-item--full--large'
										) }
									/>
								) }
							</StatsModuleListing>
						</>
					) ) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsSubscribersPage;
