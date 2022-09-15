import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	findFirstSimilarPlanKey,
	getPlan,
	isBlogger,
	isPersonal,
	isPremium,
	TYPE_BUSINESS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import getPlansForFeature from 'calypso/state/selectors/get-plans-for-feature';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import SingleListView from '../plugins-browser/single-list-view';
import usePlugins from '../use-plugins';

import './style.scss';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;

const UpgradeNudge = ( {
	selectedSite,
	sitePlan,
	isVip,
	jetpackNonAtomic,
	siteSlug,
	paidPlugins,
} ) => {
	const hasInstallPlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_PLUGINS )
	);
	const plansForInstallPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, selectedSite?.ID, FEATURE_INSTALL_PLUGINS )
	);

	const hasInstallPurchasedPlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const plansForInstallPurchasedPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);

	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	const pluginsPlansPageFlag = isEnabled( 'plugins-plans-page' );

	const pluginsPlansPage = `/plugins/plans/${ selectedSite?.slug }`;

	const translate = useTranslate();

	if (
		jetpackNonAtomic ||
		! selectedSite?.ID ||
		! sitePlan ||
		isVip ||
		hasInstallPlugins ||
		( paidPlugins && hasInstallPurchasedPlugins )
	) {
		return null;
	}

	// Paid plugins can potentially be sold on a plan lower than Business or Pro.
	// True if the "install purchased plugins" feature is available on a plan lower than the "install plugins" feature.
	const paidPluginsOnLowerPlan =
		plansForInstallPurchasedPlugins[ 0 ] !== plansForInstallPlugins[ 0 ];

	// Prevent non `paidPlugins` banners from rendering if it would duplicate the `paidPlugins` upsell.
	if ( ! paidPlugins && ! paidPluginsOnLowerPlan && ! hasInstallPurchasedPlugins ) {
		return null;
	}

	// This banner upsells the ability to install paid plugins on a plan lower than free plugins.
	if ( paidPlugins && ! hasInstallPurchasedPlugins && paidPluginsOnLowerPlan ) {
		const requiredPlan = getPlan( plansForInstallPurchasedPlugins[ 0 ] );
		const title = translate( 'Upgrade to the %(planName)s plan to install premium plugins.', {
			textOnly: true,
			args: { planName: requiredPlan.getTitle() },
		} );

		return (
			<UpsellNudge
				event="calypso_plugins_browser_upgrade_nudge"
				className={ 'plugins-discovery-page__upsell' }
				callToAction={ translate( 'Upgrade now' ) }
				icon={ 'notice-outline' }
				showIcon={ true }
				href={
					pluginsPlansPageFlag
						? pluginsPlansPage
						: `/checkout/${ siteSlug }/${ requiredPlan.getPathSlug() }`
				}
				feature={ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS }
				plan={ requiredPlan.getStoreSlug() }
				title={ title }
			/>
		);
	}

	const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
		type: TYPE_BUSINESS,
	} );

	// This banner upsells the ability to install free and paid plugins on a Pro plan.
	const isLegacyPlan = isBlogger( sitePlan ) || isPersonal( sitePlan ) || isPremium( sitePlan );
	const shouldUpsellProPlan = eligibleForProPlan && ! isLegacyPlan;
	if ( shouldUpsellProPlan ) {
		return (
			<UpsellNudge
				event="calypso_plugins_browser_upgrade_nudge"
				className={ 'plugins-discovery-page__upsell' }
				callToAction={ translate( 'Upgrade now' ) }
				icon={ 'notice-outline' }
				showIcon={ true }
				href={ pluginsPlansPageFlag ? pluginsPlansPage : `/checkout/${ siteSlug }/pro` }
				feature={ FEATURE_INSTALL_PLUGINS }
				plan={ plan }
				title={ translate( 'Upgrade to the Pro plan to install plugins.' ) }
			/>
		);
	}

	// This banner upsells the ability to install free and paid plugins on a Business plan.
	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			className={ 'plugins-discovery-page__upsell' }
			callToAction={ translate( 'Upgrade now' ) }
			icon={ 'notice-outline' }
			showIcon={ true }
			href={ pluginsPlansPageFlag ? pluginsPlansPage : `/checkout/${ siteSlug }/business` }
			feature={ FEATURE_INSTALL_PLUGINS }
			plan={ plan }
			title={ translate( 'Upgrade to the Business plan to install plugins.' ) }
		/>
	);
};

function filterPopularPlugins( popularPlugins = [], featuredPlugins = [] ) {
	const displayedFeaturedSlugsMap = new Map(
		featuredPlugins
			.slice( 0, SHORT_LIST_LENGTH ) // only displayed plugins
			.map( ( plugin ) => [ plugin.slug, plugin.slug ] )
	);

	return popularPlugins.filter(
		( plugin ) =>
			! displayedFeaturedSlugsMap.has( plugin.slug ) && isCompatiblePlugin( plugin.slug )
	);
}

const PaidPluginsSection = ( props ) => {
	const { plugins: paidPlugins = [], isFetching: isFetchingPaidPlugins } = usePlugins( {
		category: 'paid',
	} );

	if ( props.jetpackNonAtomic ) {
		return null;
	}

	return (
		<SingleListView
			{ ...props }
			category="paid"
			plugins={ paidPlugins }
			isFetching={ isFetchingPaidPlugins }
		/>
	);
};

const FeaturedPluginsSection = ( props ) => {
	return (
		<SingleListView
			{ ...props }
			plugins={ props.pluginsByCategoryFeatured }
			isFetching={ props.isFetchingPluginsByCategoryFeatured }
			category="featured"
		/>
	);
};

const PopularPluginsSection = ( props ) => {
	const { plugins: popularPlugins = [], isFetching: isFetchingPluginsByCategoryPopular } =
		usePlugins( {
			category: 'popular',
		} );

	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		props.pluginsByCategoryFeatured
	);

	return (
		<SingleListView
			{ ...props }
			category="popular"
			plugins={ pluginsByCategoryPopular }
			isFetching={ isFetchingPluginsByCategoryPopular }
		/>
	);
};

const PluginsDiscoveryPage = ( props ) => {
	const {
		plugins: pluginsByCategoryFeatured = [],
		isFetching: isFetchingPluginsByCategoryFeatured,
	} = usePlugins( {
		category: 'featured',
	} );

	return (
		<>
			<UpgradeNudge { ...props } paidPlugins={ true } />
			<PaidPluginsSection { ...props } />
			<UpgradeNudge { ...props } />
			<FeaturedPluginsSection
				{ ...props }
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
			/>
			<PopularPluginsSection { ...props } pluginsByCategoryFeatured={ pluginsByCategoryFeatured } />
		</>
	);
};

export default PluginsDiscoveryPage;
