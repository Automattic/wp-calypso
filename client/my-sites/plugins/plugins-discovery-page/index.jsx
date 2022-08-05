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
import './style.scss';
import SingleListView from '../plugins-browser/single-list-view';
import usePlugins from '../use-plugins';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;

const UpgradeNudge = ( { selectedSite, sitePlan, isVip, jetpackNonAtomic, siteSlug } ) => {
	const translate = useTranslate();
	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	if ( ! selectedSite?.ID || ! sitePlan || isVip || jetpackNonAtomic ) {
		return null;
	}
	const isLegacyPlan = isBlogger( sitePlan ) || isPersonal( sitePlan ) || isPremium( sitePlan );
	const checkoutPlan = eligibleForProPlan && ! isLegacyPlan ? 'pro' : 'business';
	const bannerURL = `/checkout/${ siteSlug }/${ checkoutPlan }`;
	const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
		type: TYPE_BUSINESS,
	} );

	const title =
		eligibleForProPlan && ! isLegacyPlan
			? translate( 'Upgrade to the Pro plan to install plugins.' )
			: translate( 'Upgrade to the Business plan to install plugins.' );

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			href={ bannerURL }
			feature={ FEATURE_INSTALL_PLUGINS }
			plan={ plan }
			title={ title }
		/>
	);
};

const UpgradeNudgePaid = ( props ) => {
	const translate = useTranslate();

	const requiredPlans = useSelector( ( state ) =>
		getPlansForFeature( state, props.selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);

	if ( ! requiredPlans ) {
		return null;
	}

	const requiredPlan = getPlan( requiredPlans[ 0 ] );

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			href={ `/checkout/${ props.siteSlug }/${ requiredPlan.getPathSlug() }` }
			feature={ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS }
			plan={ requiredPlan.getStoreSlug() }
			title={ translate( 'Upgrade to the %(planName)s plan to install premium plugins.', {
				textOnly: true,
				args: { planName: requiredPlan.getTitle() },
			} ) }
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

	return (
		<SingleListView
			{ ...props }
			category="paid"
			paidPlugins={ paidPlugins }
			isFetchingPaidPlugins={ isFetchingPaidPlugins }
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
			pluginsByCategoryPopular={ pluginsByCategoryPopular }
			isFetchingPluginsByCategoryPopular={ isFetchingPluginsByCategoryPopular }
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

	const requiredPlansPurchasedPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, props.selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const requiredPlansAllPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, props.selectedSite?.ID, FEATURE_INSTALL_PLUGINS )
	);

	const hasInstallPurchasedPlugins = useSelector( ( state ) =>
		siteHasFeature( state, props.selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);

	// Whether to show an upgrade banner specific to premium plugins.
	const lowerPlanAvailable =
		! hasInstallPurchasedPlugins &&
		requiredPlansPurchasedPlugins[ 0 ] !== requiredPlansAllPlugins[ 0 ];

	return (
		<>
			{ ! props.jetpackNonAtomic && (
				<>
					<div className="plugins-discovery-page__upgrade-banner">
						{ ! hasInstallPurchasedPlugins && lowerPlanAvailable && (
							<UpgradeNudgePaid { ...props } />
						) }
						{ ! hasInstallPurchasedPlugins && ! lowerPlanAvailable && (
							<UpgradeNudge { ...props } />
						) }
					</div>
					<PaidPluginsSection { ...props } />
				</>
			) }
			{ ( hasInstallPurchasedPlugins || lowerPlanAvailable ) && <UpgradeNudge { ...props } /> }
			<SingleListView
				{ ...props }
				category="featured"
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
			/>
			<PopularPluginsSection
				{ ...props }
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
			/>
		</>
	);
};

export default PluginsDiscoveryPage;
