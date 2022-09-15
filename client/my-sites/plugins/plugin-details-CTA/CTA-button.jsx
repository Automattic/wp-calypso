import {
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { Button, Dialog } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { marketplacePlanToAdd } from 'calypso/lib/plugins/utils';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PluginCustomDomainDialog } from '../plugin-custom-domain-dialog';
import { getPeriodVariationValue } from '../plugin-price';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';

export default function CTAButton( { plugin, hasEligibilityMessages, disabled } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ showEligibility, setShowEligibility ] = useState( false );
	const [ showAddCustomDomain, setShowAddCustomDomain ] = useState( false );

	const billingPeriod = useSelector( getBillingInterval );

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);

	// Site type
	const selectedSite = useSelector( getSelectedSite );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSite?.ID )
	);

	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	// Keep me updated
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const keepMeUpdatedPreferenceId = `jetpack-self-hosted-keep-updated-${ userId }`;
	const keepMeUpdatedPreference = useSelector( ( state ) =>
		getPreference( state, keepMeUpdatedPreferenceId )
	);
	const hasPreferences = useSelector( hasReceivedRemotePreferences );

	const primaryDomain = useSelector( ( state ) =>
		getPrimaryDomainBySiteId( state, selectedSite?.ID )
	);

	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	const pluginRequiresCustomPrimaryDomain =
		( primaryDomain?.isWPCOMDomain || primaryDomain?.isWpcomStagingDomain ) && !! plugin?.tags?.seo;
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );

	const updatedKeepMeUpdatedPreference = useCallback(
		( isChecked ) => {
			dispatch( savePreference( keepMeUpdatedPreferenceId, isChecked ) );
			dispatch(
				recordTracksEvent( 'calypso_plugins_availability_jetpack_self_hosted', {
					user_id: userId,
					value: isChecked,
				} )
			);
		},
		[ dispatch, keepMeUpdatedPreferenceId, userId ]
	);

	const { isPreinstalledPremiumPlugin, preinstalledPremiumPluginProduct } =
		usePreinstalledPremiumPlugin( plugin.slug );

	return (
		<>
			<PluginCustomDomainDialog
				onProceed={ () => {
					if ( hasEligibilityMessages ) {
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						plugin,
						upgradeAndInstall: shouldUpgrade,
						isMarketplaceProduct,
						billingPeriod,
						eligibleForProPlan,
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
							upgradeAndInstall: shouldUpgrade,
							isMarketplaceProduct,
							billingPeriod,
							eligibleForProPlan,
						} )
					}
				/>
			</Dialog>
			<Button
				className="plugin-details-cta__install-button"
				primary
				onClick={ () => {
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
						upgradeAndInstall: shouldUpgrade,
						isMarketplaceProduct,
						billingPeriod,
						eligibleForProPlan,
						isPreinstalledPremiumPlugin,
						preinstalledPremiumPluginProduct,
					} );
				} }
				disabled={
					( isJetpackSelfHosted && isMarketplaceProduct ) || isSiteConnected === false || disabled
				}
			>
				{
					// eslint-disable-next-line no-nested-ternary
					isMarketplaceProduct || isPreinstalledPremiumPlugin
						? translate( 'Purchase and activate' )
						: shouldUpgrade
						? translate( 'Upgrade and activate' )
						: translate( 'Install and activate' )
				}
			</Button>
			{ isJetpackSelfHosted && isMarketplaceProduct && (
				<div className="plugin-details-cta__not-available">
					<p className="plugin-details-cta__not-available-text">
						{ translate( 'Thanks for your interest. ' ) }
						{ translate(
							'Paid plugins are not yet available for Jetpack Sites but we can notify you when they are ready.'
						) }
					</p>
					{ hasPreferences && (
						<ToggleControl
							className="plugin-details-cta__follow-toggle"
							label={ translate( 'Keep me updated' ) }
							checked={ keepMeUpdatedPreference }
							onChange={ updatedKeepMeUpdatedPreference }
						/>
					) }
				</div>
			) }
		</>
	);
}

function onClickInstallPlugin( {
	dispatch,
	selectedSite,
	plugin,
	upgradeAndInstall,
	isMarketplaceProduct,
	billingPeriod,
	eligibleForProPlan,
	isPreinstalledPremiumPlugin,
	preinstalledPremiumPluginProduct,
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
		const product_slug = plugin?.variations?.[ variationPeriod ]?.product_slug;

		if ( upgradeAndInstall ) {
			// We also need to add a business plan to the cart.
			return page(
				`/checkout/${ selectedSite.slug }/${ marketplacePlanToAdd(
					selectedSite?.plan,
					billingPeriod,
					eligibleForProPlan
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
				billingPeriod,
				eligibleForProPlan
			) }?redirect_to=${ installPluginURL }#step2`
		);
	}

	// No need to go through chekout, go to install page directly.
	return page( installPluginURL );
}
