import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	findFirstSimilarPlanKey,
	getPlan,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	TYPE_BUSINESS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import getPlansForFeature from 'calypso/state/selectors/get-plans-for-feature';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSitePlan, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const UpgradeNudge = ( {
	siteSlug,
	paidPlugins,
	handleUpsellNudgeClick,
	secondaryCallToAction,
	secondaryOnClick,
	secondaryEvent,
} ) => {
	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	// Use selectedSite.plan because getSitePlan() doesn't return expired plans.
	const isEcommerceTrial = selectedSite?.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);
	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );

	const siteFeaturesLoaded = useSelector( ( state ) =>
		getFeaturesBySiteId( state, selectedSite?.ID )
	);
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

	const pluginsPlansPageFlag = isEnabled( 'plugins-plans-page' );

	const pluginsPlansPage = `/plugins/plans/yearly/${ selectedSite?.slug }`;

	const translate = useTranslate();
	if (
		jetpackNonAtomic ||
		! selectedSite?.ID ||
		! sitePlan ||
		isVip ||
		hasInstallPlugins ||
		! siteFeaturesLoaded ||
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
				className="plugins-discovery-page__upsell"
				callToAction={ translate( 'Upgrade now' ) }
				icon="notice-outline"
				showIcon
				href={
					pluginsPlansPageFlag
						? pluginsPlansPage
						: `/checkout/${ siteSlug }/${ requiredPlan.getPathSlug() }`
				}
				feature={ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS }
				plan={ requiredPlan.getStoreSlug() }
				title={ title }
				isOneClickCheckoutEnabled
			/>
		);
	}

	const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
		type: TYPE_BUSINESS,
	} );

	// This banner upsells the ability to install free and paid plugins on a eCommerce plan.
	if ( isEcommerceTrial ) {
		return (
			<UpsellNudge
				event="calypso_plugins_browser_upgrade_nudge"
				className="plugins-discovery-page__upsell"
				callToAction={ translate( 'Upgrade now' ) }
				icon="notice-outline"
				showIcon
				href={ `/plans/${ siteSlug }` }
				feature={ FEATURE_INSTALL_PLUGINS }
				plan={ PLAN_ECOMMERCE_MONTHLY }
				title={ translate( 'To install additional plugins, please upgrade to a paid plan.' ) }
			/>
		);
	}

	const title = translate(
		'You need to upgrade to a %(businessPlanName)s Plan to install plugins. Get a free domain with an annual plan.',
		{ args: { businessPlanName: getPlan( plan )?.getTitle() } }
	);
	// This banner upsells the ability to install free and paid plugins on a Business plan.
	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			className="plugins-discovery-page__upsell"
			callToAction={ translate( 'Upgrade to %(planName)s', {
				args: { planName: getPlan( plan )?.getTitle() },
			} ) }
			icon="notice-outline"
			showIcon
			onClick={ handleUpsellNudgeClick }
			secondaryCallToAction={ secondaryCallToAction }
			secondaryOnClick={ secondaryOnClick }
			secondaryEvent={ secondaryEvent }
			feature={ FEATURE_INSTALL_PLUGINS }
			plan={ plan }
			title={ title }
			isOneClickCheckoutEnabled
		/>
	);
};

export default UpgradeNudge;
