import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { ToggleControl, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { marketplacePlanToAdd, getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import useAtomicSiteHasEquivalentFeatureToPlugin from 'calypso/my-sites/plugins/use-atomic-site-has-equivalent-feature-to-plugin';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getFirstCategoryFromTags } from '../categories/use-categories';
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

	const isECommerceTrial = useSelector( ( state ) =>
		isSiteOnECommerceTrial( state, selectedSite?.ID )
	);

	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	// Keep me updated
	const userId = useSelector( getCurrentUserId );
	const keepMeUpdatedPreferenceId = `jetpack-self-hosted-keep-updated-${ userId }`;
	const keepMeUpdatedPreference = useSelector( ( state ) =>
		getPreference( state, keepMeUpdatedPreferenceId )
	);
	const hasPreferences = useSelector( hasReceivedRemotePreferences );

	const primaryDomain = useSelector( ( state ) =>
		getPrimaryDomainBySiteId( state, selectedSite?.ID )
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

	// Atomic sites already include features such as Jetpack backup, scan, videopress, publicize, and search. So
	// therefore we should prevent users from installing these standalone plugin equivalents.
	const atomicSiteHasEquivalentFeatureToPlugin = useAtomicSiteHasEquivalentFeatureToPlugin(
		plugin.slug
	);

	const productsList = useSelector( getProductsList );

	const pluginsPlansPageFlag = isEnabled( 'plugins-plans-page' );
	const pluginsPlansPage = `/plugins/plans/${ plugin.slug }/yearly/${ selectedSite?.slug }`;

	let buttonText = translate( 'Install and activate' );

	if ( isMarketplaceProduct || isPreinstalledPremiumPlugin ) {
		buttonText = translate( 'Purchase and activate' );
	} else if ( isECommerceTrial ) {
		buttonText = translate( 'Upgrade your plan' );
	} else if ( shouldUpgrade ) {
		buttonText = translate( 'Upgrade and activate' );
	} else if ( atomicSiteHasEquivalentFeatureToPlugin ) {
		buttonText = translate( 'Included with your plan' );
	}

	const handleDismissEligibilityWarnings = useCallback( () => {
		setShowEligibility( false );
		setShowAddCustomDomain( false );
	}, [ setShowEligibility, setShowAddCustomDomain ] );

	return (
		<>
			<PluginCustomDomainDialog
				onProceed={ () => {
					if ( hasEligibilityMessages ) {
						if ( pluginsPlansPageFlag && shouldUpgrade ) {
							return page( pluginsPlansPage );
						}
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						plugin,
						upgradeAndInstall: shouldUpgrade,
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
			{ showEligibility && (
				<Modal
					className="plugin-details-cta__dialog-content"
					title={ translate( 'Before you continue' ) }
					onRequestClose={ () => setShowEligibility( false ) }
					size="medium"
				>
					<EligibilityWarnings
						currentContext="plugin-details"
						isMarketplace={ isMarketplaceProduct }
						standaloneProceed
						onDismiss={ handleDismissEligibilityWarnings }
						onProceed={ () =>
							onClickInstallPlugin( {
								dispatch,
								selectedSite,
								plugin,
								upgradeAndInstall: shouldUpgrade,
								isMarketplaceProduct,
								billingPeriod,
								productsList,
							} )
						}
					/>
				</Modal>
			) }
			<Button
				className="plugin-details-cta__install-button"
				primary
				onClick={ () => {
					if ( pluginRequiresCustomPrimaryDomain ) {
						return setShowAddCustomDomain( true );
					}
					if ( isECommerceTrial ) {
						return page(
							`/plans/${ selectedSite.slug }?feature=${ encodeURIComponent(
								FEATURE_INSTALL_PLUGINS
							) }`
						);
					}
					if ( hasEligibilityMessages ) {
						if ( pluginsPlansPageFlag && shouldUpgrade ) {
							return page( pluginsPlansPage );
						}
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						plugin,
						upgradeAndInstall: shouldUpgrade,
						isMarketplaceProduct,
						billingPeriod,
						isPreinstalledPremiumPlugin,
						preinstalledPremiumPluginProduct,
						productsList,
					} );
				} }
				disabled={
					( isJetpackSelfHosted && isMarketplaceProduct ) ||
					isSiteConnected === false ||
					atomicSiteHasEquivalentFeatureToPlugin ||
					disabled
				}
			>
				{ buttonText }
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
	isPreinstalledPremiumPlugin,
	preinstalledPremiumPluginProduct,
	productsList,
} ) {
	const tags = Object.keys( plugin.tags );

	dispatch( removePluginStatuses( 'completed', 'error', 'up-to-date' ) );

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
			tags: tags.join( ',' ),
			category: getFirstCategoryFromTags( tags ),
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
				) },${ product_slug }`
			);
		}

		return page( `/checkout/${ selectedSite.slug }/${ product_slug }#step2` );
	}

	if ( isPreinstalledPremiumPlugin ) {
		const checkoutUrl = `/checkout/${ selectedSite.slug }/${ preinstalledPremiumPluginProduct }`;
		const installUrl = `/marketplace/plugin/${ plugin.slug }/install/${ selectedSite.slug }`;
		return page( `${ checkoutUrl }?redirect_to=${ installUrl }#step2` );
	}

	// After buying a plan we need to redirect to the plugin install page.
	const installPluginURL = `/marketplace/plugin/${ plugin.slug }/install/${ selectedSite.slug }`;
	if ( upgradeAndInstall ) {
		// We also need to add a business plan to the cart.
		return page(
			`/checkout/${ selectedSite.slug }/${ marketplacePlanToAdd(
				selectedSite?.plan,
				billingPeriod
			) }?redirect_to=${ installPluginURL }#step2`
		);
	}

	// No need to go through checkout, go to install page directly.
	return page( installPluginURL );
}
