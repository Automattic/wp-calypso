import { Button, Dialog } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { businessPlanToAdd } from 'calypso/lib/plugins/utils';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { PluginCustomDomainDialog } from '../plugin-custom-domain-dialog';
import { getPeriodVariationValue } from '../plugin-price';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';

export default function CTAButton( {
	plugin,
	selectedSite,
	shouldUpgrade,
	hasEligibilityMessages,
	isMarketplaceProduct,
	billingPeriod,
	isJetpackSelfHosted,
	isSiteConnected,
	isPluginPurchased,
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ showEligibility, setShowEligibility ] = useState( false );
	const [ showAddCustomDomain, setShowAddCustomDomain ] = useState( false );

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
		( primaryDomain?.isWPCOMDomain || primaryDomain?.isWpcomStagingDomain ) &&
		plugin?.requirements?.required_primary_domain;
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

	let installButtonText = translate( 'Install and activate' );
	if ( ! isPluginPurchased && ( isMarketplaceProduct || isPreinstalledPremiumPlugin ) ) {
		installButtonText = translate( 'Purchase and activate' );
	} else if ( shouldUpgrade ) {
		installButtonText = translate( 'Upgrade and activate' );
	}

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
						isPluginPurchased,
					} );
				} }
				isDialogVisible={ showAddCustomDomain }
				plugin={ plugin }
				domains={ domains }
				closeDialog={ () => setShowAddCustomDomain( false ) }
			/>
			<Dialog
				additionalClassNames={ 'plugin-details-CTA__dialog-content' }
				additionalOverlayClassNames={ 'plugin-details-CTA__modal-overlay' }
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
							isPluginPurchased,
						} )
					}
				/>
			</Dialog>
			<Button
				className="plugin-details-CTA__install-button"
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
						isPluginPurchased,
					} );
				} }
				disabled={ ( isJetpackSelfHosted && isMarketplaceProduct ) || isSiteConnected === false }
			>
				{ installButtonText }
			</Button>
			{ isJetpackSelfHosted && isMarketplaceProduct && (
				<div className="plugin-details-CTA__not-available">
					<p className="plugin-details-CTA__not-available-text">
						{ translate( 'Thanks for your interest. ' ) }
						{ translate(
							'Paid plugins are not yet available for Jetpack Sites but we can notify you when they are ready.'
						) }
					</p>
					{ hasPreferences && (
						<ToggleControl
							className="plugin-details-CTA__follow-toggle"
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
	isPluginPurchased,
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

	if ( ! isPluginPurchased && isMarketplaceProduct ) {
		// We need to add the product to the  cart.
		// Plugin install is handled on the backend by activating the subscription.
		const variationPeriod = getPeriodVariationValue( billingPeriod );
		const product_slug = plugin?.variations?.[ variationPeriod ]?.product_slug;

		if ( upgradeAndInstall ) {
			// We also need to add a business plan to the cart.
			return page(
				`/checkout/${ selectedSite.slug }/${ businessPlanToAdd(
					selectedSite?.plan,
					billingPeriod,
					eligibleForProPlan,
					true
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
			`/checkout/${ selectedSite.slug }/${ businessPlanToAdd(
				selectedSite?.plan,
				billingPeriod,
				eligibleForProPlan
			) }?redirect_to=${ installPluginURL }#step2`
		);
	}

	// No need to go through chekout, go to install page directly.
	return page( installPluginURL );
}
