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
	const hasInstallPurchasedPlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const requiredPlansPurchasedPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const requiredPlansAllPlugins = useSelector( ( state ) =>
		getPlansForFeature( state, selectedSite?.ID, FEATURE_INSTALL_PLUGINS )
	);

	const translate = useTranslate();

	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	const requiredPlans = useSelector( ( state ) =>
		getPlansForFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);

	// Whether to show an upgrade banner specific to premium plugins.
	const lowerPlanAvailable =
		! hasInstallPurchasedPlugins &&
		requiredPlansPurchasedPlugins[ 0 ] !== requiredPlansAllPlugins[ 0 ];

	let bannerURL;
	let feature;
	let plan;
	let title;

	if ( paidPlugins && ! hasInstallPurchasedPlugins && lowerPlanAvailable ) {
		if ( ! requiredPlans ) {
			return null;
		}

		const requiredPlan = getPlan( requiredPlans[ 0 ] );

		bannerURL = `/checkout/${ siteSlug }/${ requiredPlan.getPathSlug() }`;
		feature = WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS;
		plan = requiredPlan.getStoreSlug();
		title = translate( 'Upgrade to the %(planName)s plan to install premium plugins.', {
			textOnly: true,
			args: { planName: requiredPlan.getTitle() },
		} );
	} else if (
		( paidPlugins && ! hasInstallPurchasedPlugins && ! lowerPlanAvailable ) ||
		( ! paidPlugins && ( hasInstallPurchasedPlugins || lowerPlanAvailable ) )
	) {
		if ( ! selectedSite?.ID || ! sitePlan || isVip || jetpackNonAtomic ) {
			return null;
		}
		const isLegacyPlan = isBlogger( sitePlan ) || isPersonal( sitePlan ) || isPremium( sitePlan );
		const checkoutPlan = eligibleForProPlan && ! isLegacyPlan ? 'pro' : 'business';
		bannerURL = `/checkout/${ siteSlug }/${ checkoutPlan }`;
		feature = FEATURE_INSTALL_PLUGINS;
		plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
			type: TYPE_BUSINESS,
		} );
		title =
			eligibleForProPlan && ! isLegacyPlan
				? translate( 'Upgrade to the Pro plan to install plugins.' )
				: translate( 'Upgrade to the Business plan to install plugins.' );
	} else {
		return null;
	}

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			href={ bannerURL }
			feature={ feature }
			plan={ plan }
			title={ title }
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
			{ ! props.jetpackNonAtomic && (
				<>
					<div className="plugins-discovery-page__upgrade-banner">
						<UpgradeNudge { ...props } paidPlugins={ true } />
					</div>
					<PaidPluginsSection { ...props } />
				</>
			) }
			{ <UpgradeNudge { ...props } /> }
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
