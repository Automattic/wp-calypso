// import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state';
// import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
// import { isJetpackSite, getSiteSlug, isSimpleSite } from 'calypso/state/sites/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
// import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { default as usePlanUsageQuery } from '../../hooks/use-plan-usage-query';
import useStatsPurchases from '../../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../../stats-module/placeholder';
import PageViewTracker from '../../stats-page-view-tracker';
import StatsUtmBuilderForm from '../../stats-utm-builder-form';

const StatsUtmBuilderPage = () => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	// const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	// const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/utm-builder/:site" title="Stats > UTM builder" />
			<div
				className={ classNames(
					'stats',
					'stats-utm-builder-page'
					// {
					//	 'stats-utm-builder-page--is-wpcom': isTypeDetectionEnabled && isWPCOMSite,
					// }
				) }
			>
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate( "View your site's performance and learn from trends." ) }
					screenReader={ navItems.utmBuilder?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="utmBuilder" siteId={ siteId } slug={ siteSlug } />
				{ isFetching && <StatsModulePlaceholder className="is-subscriber-page" isLoading /> }
				{ ! isFetching && (
					<>
						<h1 className="stats-page__heading">UTM Builder</h1>
						<StatsUtmBuilderForm />
					</>
				) }
				{ ! isAdvancedFeatureEnabled && <>Upgrade now to enable UTM feature and the builder.</> }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsUtmBuilderPage;
