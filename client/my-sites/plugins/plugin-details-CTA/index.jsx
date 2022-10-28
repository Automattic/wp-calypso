/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { Gridicon, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getPluginPurchased, getSoftwareSlug, getSaasRedirectUrl } from 'calypso/lib/plugins/utils';
import { userCan } from 'calypso/lib/site/utils';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { ManageSitePluginsDialog } from 'calypso/my-sites/plugins/manage-site-plugins-dialog';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { isUserLoggedIn, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import {
	isRequestingForSites,
	getSiteObjectsWithPlugin,
	getPluginOnSite,
} from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PREINSTALLED_PLUGINS } from '../constants';
import { PluginPrice } from '../plugin-price';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';
import CTAButton from './CTA-button';
import { ActivationButton } from './activation-button';
import { ManagePluginMenu } from './manage-plugin-menu';
import PluginDetailsCTAPreinstalledPremiumPlugins from './preinstalled-premium-plugins-CTA';
import './style.scss';

const PluginDetailsCTA = ( { plugin, isPlaceholder } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const selectedSite = useSelector( getSelectedSite );
	const billingPeriod = useSelector( getBillingInterval );

	const currentUserId = useSelector( getCurrentUserId );

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const currentPurchase = getPluginPurchased( plugin, purchases, isMarketplaceProduct );

	// Site type
	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;
	const incompatiblePlugin = ! isJetpackSelfHosted && ! isCompatiblePlugin( softwareSlug );
	const userCantManageTheSite = ! userCan( 'manage_options', selectedSite );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, softwareSlug )
	);
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );

	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);

	const isPluginInstalledOnsite =
		sitesWithPlugins.length && ! requestingPluginsForSites ? !! sitePlugin : false;
	const isPluginInstalledOnsiteWithSubscription =
		isPluginInstalledOnsite && ! isMarketplaceProduct ? true : currentPurchase?.active;
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, softwareSlug )
	);
	const installedOnSitesQuantity = sitesWithPlugin.length;

	const [ displayManageSitePluginsModal, setDisplayManageSitePluginsModal ] = useState( false );

	// Eligibilities for Simple Sites.
	// eslint-disable-next-line prefer-const
	let { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);

	const upgradeToBusinessHRef = useMemo( () => {
		const pluginsPlansPageFlag = isEnabled( 'plugins-plans-page' );

		const siteSlug = selectedSite?.slug;

		const pluginsPlansPage = `/plugins/plans/yearly/${ siteSlug }`;
		return pluginsPlansPageFlag ? pluginsPlansPage : `/checkout/${ siteSlug }/business`;
	}, [ selectedSite?.slug ] );

	const saasRedirectHRef = useMemo( () => {
		return getSaasRedirectUrl( plugin, currentUserId, selectedSite?.ID );
	}, [ currentUserId, plugin, selectedSite?.ID ] );
	/*
	 * Remove 'NO_BUSINESS_PLAN' holds if the INSTALL_PURCHASED_PLUGINS feature is present.
	 *
	 * Starter plans do not have the ATOMIC feature, but they have the
	 * INSTALL_PURCHASED_PLUGINS feature which allows them to buy marketplace
	 * addons (which do have the ATOMIC feature).
	 *
	 * This means a Starter plan about to purchase a marketplace addon might get a
	 * 'NO_BUSINESS_PLAN' hold on atomic transfer; however, if we're about to buy a
	 * marketplace addon which provides the ATOMIC feature, then we can ignore this
	 * hold.
	 */
	if ( typeof eligibilityHolds !== 'undefined' && isMarketplaceProduct && ! shouldUpgrade ) {
		eligibilityHolds = eligibilityHolds.filter( ( hold ) => hold !== 'NO_BUSINESS_PLAN' );
	}

	const hasEligibilityMessages =
		! isAtomic && ! isJetpack && ( eligibilityHolds?.length || eligibilityWarnings?.length );

	const { isPreinstalledPremiumPlugin } = usePreinstalledPremiumPlugin( plugin.slug );

	const toggleDisplayManageSitePluginsModal = useCallback( () => {
		setDisplayManageSitePluginsModal( ! displayManageSitePluginsModal );
	}, [ displayManageSitePluginsModal ] );

	// If we cannot retrieve plugin status through jetpack ( ! isJetpack ) and plugin is preinstalled.
	if ( ! isJetpack && PREINSTALLED_PLUGINS.includes( plugin.slug ) ) {
		return (
			<div className="plugin-details-cta__container">
				<div className="plugin-details-cta__price">{ translate( 'Free' ) }</div>
				<span className="plugin-details-cta__preinstalled">
					{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }
				</span>
			</div>
		);
	}

	// Some plugins can be preinstalled on WPCOM and available as standalone on WPORG,
	// but require a paid upgrade to function.
	if ( isPreinstalledPremiumPlugin ) {
		return (
			<div className="plugin-details-cta__container">
				<PluginDetailsCTAPreinstalledPremiumPlugins
					isPluginInstalledOnsite={ isPluginInstalledOnsiteWithSubscription }
					plugin={ plugin }
				/>
			</div>
		);
	}

	if ( isPlaceholder || requestingPluginsForSites ) {
		return <PluginDetailsCTAPlaceholder />;
	}

	if ( isPluginInstalledOnsite && sitePlugin ) {
		// Check if already instlaled on the site
		const activeText = translate( '{{span}}active{{/span}}', {
			components: {
				span: <span className="plugin-details-cta__installed-text-active"></span>,
			},
		} );
		const inactiveText = translate( '{{span}}deactivated{{/span}}', {
			components: {
				span: <span className="plugin-details-cta__installed-text-inactive"></span>,
			},
		} );
		const { active } = sitePlugin;

		return (
			<div className="plugin-details-cta__container">
				<div className="plugin-details-cta__container-header">
					<div className="plugin-details-cta__installed-text">
						{ translate( 'Installed and {{activation /}}', {
							components: {
								activation: active ? activeText : inactiveText,
							},
						} ) }
					</div>
					<div className="plugin-details-cta__manage-plugin-menu">
						<ManagePluginMenu plugin={ plugin } />
					</div>
				</div>

				<ActivationButton plugin={ plugin } active={ active } />

				<PluginAutoupdateToggle
					site={ selectedSite }
					plugin={ sitePlugin }
					label={
						<span className="plugin-details-cta__autoupdate-text">
							<span className="plugin-details-cta__autoupdate-text-main">
								{ translate( 'Enable autoupdates.' ) }
							</span>
							{ sitePlugin.version && (
								<span className="plugin-details-cta__autoupdate-text-version">
									{ translate( ' Currently %(version)s', {
										args: { version: sitePlugin.version },
									} ) }
								</span>
							) }
						</span>
					}
					isMarketplaceProduct={ plugin.isMarketplaceProduct }
					productPurchase={ currentPurchase }
					wporg
				/>
			</div>
		);
	}

	if ( ! selectedSite && isLoggedIn ) {
		// Check if there is no site selected
		return (
			<div className="plugin-details-cta__container">
				<ManageSitePluginsDialog
					plugin={ plugin }
					isVisible={ displayManageSitePluginsModal }
					onClose={ () => setDisplayManageSitePluginsModal( false ) }
				/>
				<div className="plugin-details-cta__installed-text">
					{ !! installedOnSitesQuantity &&
						translate(
							'Installed on {{span}}%d site{{/span}}',
							'Installed on {{span}}%d sites{{/span}}',
							{
								args: [ installedOnSitesQuantity ],
								installedOnSitesQuantity,
								components: {
									span: <span className="plugin-details-cta__installed-text-quantity"></span>,
								},
								count: installedOnSitesQuantity,
							}
						) }
				</div>
				<Button onClick={ toggleDisplayManageSitePluginsModal }>
					{ translate( 'Manage sites' ) }
				</Button>
			</div>
		);
	}

	return (
		<Fragment>
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<div className="plugin-details-cta__container">
				{ ! plugin.isSaasProduct && (
					<div className="plugin-details-cta__price">
						<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
							{ ( { isFetching, price, period } ) =>
								isFetching ? (
									<div className="plugin-details-cta__price-placeholder">...</div>
								) : (
									<>
										{ price ? (
											<>
												{ price + ' ' }
												<span className="plugin-details-cta__period">{ period }</span>
											</>
										) : (
											translate( 'Free' )
										) }
									</>
								)
							}
						</PluginPrice>
					</div>
				) }
				{ isMarketplaceProduct && ! plugin.isSaasProduct && (
					<BillingIntervalSwitcher
						billingPeriod={ billingPeriod }
						onChange={ ( interval ) => dispatch( setBillingInterval( interval ) ) }
						plugin={ plugin }
					/>
				) }
				<div className="plugin-details-cta__install">
					<PrimaryButton
						isLoggedIn={ isLoggedIn }
						shouldUpgrade={ shouldUpgrade }
						hasEligibilityMessages={ hasEligibilityMessages }
						incompatiblePlugin={ incompatiblePlugin }
						userCantManageTheSite={ userCantManageTheSite }
						translate={ translate }
						plugin={ plugin }
						saasRedirectHRef={ saasRedirectHRef }
					/>
				</div>
				{ ! isJetpackSelfHosted && ! isMarketplaceProduct && (
					<div className="plugin-details-cta__t-and-c">
						{ translate(
							'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
							{
								components: {
									a: (
										<a
											target="_blank"
											rel="noopener noreferrer"
											href="https://wordpress.com/tos/"
										/>
									),
									thirdPartyTos: (
										<a
											target="_blank"
											rel="noopener noreferrer"
											href="https://wordpress.com/third-party-plugins-terms/"
										/>
									),
								},
							}
						) }
					</div>
				) }
				{ ! plugin.isSaasProduct && shouldUpgrade && isLoggedIn && (
					<UpgradeRequiredContent translate={ translate } />
				) }
				{ plugin.isSaasProduct && shouldUpgrade && isLoggedIn && (
					<div className="plugin-details-cta__upgrade-required-card">
						<UpgradeRequiredContent translate={ translate } />
						<Button
							href={ upgradeToBusinessHRef }
							className="plugin-details-cta__install-button"
							primary
							onClick={ () => {} }
						>
							{ translate( 'Upgrade to Business' ) }
						</Button>
					</div>
				) }
			</div>
		</Fragment>
	);
};

function PrimaryButton( {
	isLoggedIn,
	shouldUpgrade,
	hasEligibilityMessages,
	incompatiblePlugin,
	userCantManageTheSite,
	translate,
	plugin,
	saasRedirectHRef,
} ) {
	if ( ! isLoggedIn ) {
		return (
			<Button
				type="a"
				className="plugin-details-CTA__install-button"
				primary
				onClick={ ( e ) => e.stopPropagation() }
				href={ localizeUrl( 'https://wordpress.com/pricing/' ) }
			>
				{ translate( 'View plans' ) }
			</Button>
		);
	}
	if ( plugin.isSaasProduct ) {
		return (
			<Button
				className="plugin-details-cta__install-button"
				primary={ ! shouldUpgrade }
				href={ saasRedirectHRef }
			>
				{ translate( 'Get started' ) }
				<Gridicon icon="external" />
			</Button>
		);
	}

	return (
		<CTAButton
			plugin={ plugin }
			hasEligibilityMessages={ hasEligibilityMessages }
			disabled={ incompatiblePlugin || userCantManageTheSite }
		/>
	);
}

function UpgradeRequiredContent( { translate } ) {
	return (
		<div className="plugin-details-cta__upgrade-required">
			<span className="plugin-details-cta__upgrade-required-icon">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="notice-outline" size={ 20 } />
				{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
			</span>
			<span className="plugin-details-cta__upgrade-required-text">
				{ translate( 'You need to upgrade your plan to install plugins.' ) }
			</span>
		</div>
	);
}

function PluginDetailsCTAPlaceholder() {
	return (
		<div className="plugin-details-cta__container is-placeholder">
			<div className="plugin-details-cta__price">...</div>
			<div className="plugin-details-cta__install">...</div>
			<div className="plugin-details-cta__t-and-c">...</div>
		</div>
	);
}

export default PluginDetailsCTA;
