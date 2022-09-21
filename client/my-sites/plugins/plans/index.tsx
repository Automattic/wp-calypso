import {
	FEATURE_INSTALL_PLUGINS,
	PLAN_BUSINESS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { marketplacePlanToAdd, getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { appendBreadcrumb } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PluginCustomDomainDialog } from '../plugin-custom-domain-dialog';
import { getPeriodVariationValue } from '../plugin-price';

import './style.scss';

const Plans = ( {
	pluginSlug,
	intervalType,
}: {
	pluginSlug: string | false;
	intervalType: 'yearly' | 'monthly';
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const breadcrumbs = useSelector( getBreadcrumbs );
	const selectedSite = useSelector( getSelectedSite );

	const [ showEligibility, setShowEligibility ] = useState( false );
	const [ showAddCustomDomain, setShowAddCustomDomain ] = useState( false );

	// const {
	// 	data: wpComPluginData,
	// 	isFetched: isWpComPluginFetched,
	// 	isFetching: isWpComPluginFetching,
	// } = useWPCOMPlugin( props.pluginSlug, { enabled: isProductListFetched && isMarketplaceProduct } );

	// // Unify plugin details
	// const fullPlugin = useMemo( () => {
	// 	const wpcomPlugin = {
	// 		...wpComPluginData,
	// 		fetched: isWpComPluginFetched,
	// 	};

	// 	return {
	// 		...wpcomPlugin,
	// 		...wporgPlugin,
	// 		...plugin,
	// 		fetched: wpcomPlugin?.fetched || wporgPlugin?.fetched,
	// 		isMarketplaceProduct,
	// 	};
	// }, [ plugin, wporgPlugin, wpComPluginData, isWpComPluginFetched, isMarketplaceProduct ] );

	const billingPeriod = useSelector( getBillingInterval );

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, pluginSlug )
	);

	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;

	const primaryDomain = useSelector( ( state ) =>
		getPrimaryDomainBySiteId( state, selectedSite?.ID || null )
	);

	const pluginRequiresCustomPrimaryDomain =
		( primaryDomain?.isWPCOMDomain || primaryDomain?.isWpcomStagingDomain ) && !! plugin?.tags?.seo;
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );

	const productsList = useSelector( getProductsList );

	useEffect( () => {
		if ( breadcrumbs.length === 0 ) {
			dispatch(
				appendBreadcrumb( {
					label: translate( 'Plugins' ),
					href: `/plugins/${ selectedSite?.slug || '' }`,
					id: 'plugins',
					helpBubble: translate(
						'Add new functionality and integrations to your site with plugins.'
					),
				} )
			);
		}

		dispatch(
			appendBreadcrumb( {
				label: translate( 'Plan Upgrade' ),
				href: `/plugins/plans/${ intervalType }/${ selectedSite?.slug || '' }`,
				id: `plugin-plans`,
			} )
		);
	}, [ dispatch, translate, selectedSite, breadcrumbs.length, intervalType ] );

	let path = '/plugins/plans/:interval/:site';
	if ( pluginSlug ) {
		path = '/plugins/plans/:plugin/:interval/:site';
	}

	return (
		<MainComponent wideLayout>
			<PageViewTracker path={ path } title="Plugins > Plan Upgrade" />
			<DocumentHead title={ translate( 'Plugins > Plan Upgrade' ) } />
			<FixedNavigationHeader navigationItems={ breadcrumbs } />
			<FormattedHeader
				className="plugin-plans-header"
				headerText={ `Your current plan doesn't support plugins` }
				subHeaderText={ `Choose the plan that's right for you and reimagine what's possible with plugins` }
				brandFont
			/>
			<div className="plans">
				<PlansFeaturesMain
					basePlansPath="/plugins/plans"
					site={ selectedSite }
					intervalType={ intervalType }
					selectedFeature={ pluginFeature }
					selectedPlan={ PLAN_BUSINESS }
					shouldShowPlansFeatureComparison
					isReskinned
					onUpgradeClick={ () => {
						if ( pluginRequiresCustomPrimaryDomain ) {
							return setShowAddCustomDomain( true );
						}
						if ( hasEligibilityMessages ) {
							return setShowEligibility( true );
						}
						onClickInstallPlugin( {
							dispatch,
							selectedSite,
							plugin,
							upgradeAndInstall: true,
							isMarketplaceProduct,
							billingPeriod,
							productsList,
						} );
					} }
				/>
			</div>
			<PluginCustomDomainDialog
				onProceed={ () => {
					if ( hasEligibilityMessages ) {
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						plugin,
						upgradeAndInstall: true,
						isMarketplaceProduct,
						billingPeriod,
						productsList,
					} );
				} }
				isDialogVisible={ showAddCustomDomain }
				plugin={ plugin }
				domains={ domains }
				closeDialog={ () => setShowAddCustomDomain( false ) }
			/>
			<Dialog
				additionalClassNames={ 'plugin-details-cta__dialog-content' }
				additionalOverlayClassNames={ 'plugin-details-cta__modal-overlay' }
				isVisible={ showEligibility }
				title={ translate( 'Eligibility' ) }
				onClose={ () => setShowEligibility( false ) }
			>
				<EligibilityWarnings
					currentContext={ 'plugin-details' }
					isMarketplace={ isMarketplaceProduct }
					standaloneProceed
					onProceed={ () =>
						onClickInstallPlugin( {
							dispatch,
							selectedSite,
							plugin,
							upgradeAndInstall: true,
							isMarketplaceProduct,
							billingPeriod,
							productsList,
						} )
					}
				/>
			</Dialog>
		</MainComponent>
	);
};

export default Plans;

function onClickInstallPlugin( {
	dispatch,
	selectedSite,
	plugin,
	upgradeAndInstall,
	isMarketplaceProduct,
	billingPeriod,
	isPreinstalledPremiumPlugin,
	preinstalledPremiumPluginProduct,
	productsList,
} ) {
	dispatch( removePluginStatuses( 'completed', 'error' ) );

	dispatch(
		recordGoogleEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', plugin.slug )
	);
	dispatch(
		recordGoogleEvent( 'calypso_plugin_install_click_from_plugin_info', {
			site: selectedSite?.ID,
			plugin: plugin.slug,
		} )
	);
	dispatch(
		recordTracksEvent( 'calypso_plugin_install_activate_click', {
			plugin: plugin.slug,
			blog_id: selectedSite?.ID,
			marketplace_product: isMarketplaceProduct,
			needs_plan_upgrade: upgradeAndInstall,
		} )
	);

	dispatch( productToBeInstalled( plugin.slug, selectedSite.slug ) );

	if ( isMarketplaceProduct ) {
		// We need to add the product to the  cart.
		// Plugin install is handled on the backend by activating the subscription.
		const variationPeriod = getPeriodVariationValue( billingPeriod );

		const variation = plugin?.variations?.[ variationPeriod ];
		const product_slug = getProductSlugByPeriodVariation( variation, productsList );

		if ( upgradeAndInstall ) {
			// We also need to add a business plan to the cart.
			return page(
				`/checkout/${ selectedSite.slug }/${ marketplacePlanToAdd(
					selectedSite?.plan,
					billingPeriod
				) },${ product_slug }?redirect_to=/marketplace/thank-you/${ plugin.slug }/${
					selectedSite.slug
				}`
			);
		}

		return page(
			`/checkout/${ selectedSite.slug }/${ product_slug }?redirect_to=/marketplace/thank-you/${ plugin.slug }/${ selectedSite.slug }#step2`
		);
	}

	if ( isPreinstalledPremiumPlugin ) {
		const checkoutUrl = `/checkout/${ selectedSite.slug }/${ preinstalledPremiumPluginProduct }`;
		const installUrl = `/marketplace/${ plugin.slug }/install/${ selectedSite.slug }`;
		return page( `${ checkoutUrl }?redirect_to=${ installUrl }#step2` );
	}

	// After buying a plan we need to redirect to the plugin install page.
	const installPluginURL = `/marketplace/${ plugin.slug }/install/${ selectedSite.slug }`;
	if ( upgradeAndInstall ) {
		// We also need to add a business plan to the cart.
		return page(
			`/checkout/${ selectedSite.slug }/${ marketplacePlanToAdd(
				selectedSite?.plan,
				billingPeriod
			) }?redirect_to=${ installPluginURL }#step2`
		);
	}

	// No need to go through chekout, go to install page directly.
	return page( installPluginURL );
}
