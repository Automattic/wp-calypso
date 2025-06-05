/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	getPlan,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { Gridicon, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { fixMe, useTranslate } from 'i18n-calypso';
import { Fragment, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getPluginPurchased, getSoftwareSlug, getSaasRedirectUrl } from 'calypso/lib/plugins/utils';
import { setQueryArgs } from 'calypso/lib/query-args';
import { addQueryArgs } from 'calypso/lib/route';
import { userCan } from 'calypso/lib/site/utils';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { ManageSitePluginsDialog } from 'calypso/my-sites/plugins/manage-site-plugins-dialog';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import StagingSiteNotice from 'calypso/my-sites/plugins/plugin-details-CTA/staging-site-notice';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import {
	isUserLoggedIn,
	getCurrentUserId,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import {
	isRequestingForSites,
	isRequestingForAllSites,
	getSiteObjectsWithPlugin,
	getPluginOnSite,
} from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSectionName } from 'calypso/state/ui/selectors';
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

	const currentUserSiteCount = useSelector( getCurrentUserSiteCount );

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const currentPurchase = getPluginPurchased( plugin, purchases );

	// Site type
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const isWpcomStaging = useSelector( ( state ) => isSiteWpcomStaging( state, selectedSite?.ID ) );
	const isDisabledForWpcomStaging = isWpcomStaging && isMarketplaceProduct;
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;
	const incompatiblePlugin = ! isJetpackSelfHosted && ! isCompatiblePlugin( softwareSlug );
	const userCantManageTheSite = ! userCan( 'manage_options', selectedSite );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, softwareSlug )
	);

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

	// Eligibilities for Simple Sites.
	// eslint-disable-next-line prefer-const
	let { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);

	const upgradeToBusinessHref = useMemo( () => {
		const pluginsPlansPageFlag = isEnabled( 'plugins-plans-page' );

		const siteSlug = selectedSite?.slug;

		const pluginsPlansPage = `/plugins/plans/yearly/${ siteSlug }`;
		const checkoutPage = siteSlug ? `/checkout/${ siteSlug }/business` : `/checkout/business`;
		return pluginsPlansPageFlag ? pluginsPlansPage : checkoutPage;
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

	const onIntervalSwitcherChange = useCallback(
		( interval ) => {
			setQueryArgs( { interval: interval?.toLowerCase() }, true );
			dispatch( setBillingInterval( interval ) );
		},
		[ dispatch ]
	);

	// Activation and deactivation translations.
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

	const getTermsAndConditions = () => {
		const translateArgs = {
			components: {
				a: (
					<a
						target="_blank"
						rel="noopener noreferrer"
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
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
		};

		return fixMe( {
			text: 'By installing, you agree to {{a}}WordPress.com Terms of Service{{/a}} and {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
			newCopy: translate(
				'By installing, you agree to {{a}}WordPress.com Terms of Service{{/a}} and {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
				translateArgs
			),
			oldCopy: translate(
				'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
				translateArgs
			),
		} );
	};

	// If we cannot retrieve plugin status through jetpack ( ! isJetpack ) and plugin is preinstalled.
	if ( ! isJetpack && PREINSTALLED_PLUGINS.includes( plugin.slug ) ) {
		return (
			<div className="plugin-details-cta__container">
				{ selectedSite ? (
					<div className="plugin-details-cta__installed-text">
						{ translate( 'Installed and {{activation /}}', {
							components: {
								activation: activeText,
							},
						} ) }
					</div>
				) : (
					<div className="plugin-details-cta__price">{ translate( 'Free' ) }</div>
				) }
				<span className="plugin-details-cta__preinstalled">
					<p>{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }</p>
					{ selectedSite && shouldUpgrade && (
						<p>
							{ translate(
								'Upgrade your plan and get access to another 50,000 WordPress plugins to extend functionality for your site.'
							) }
						</p>
					) }
				</span>

				{ selectedSite && shouldUpgrade && (
					<Button
						href={ upgradeToBusinessHref }
						className="plugin-details-cta__install-button"
						primary
					>
						{ translate( 'Upgrade my plan' ) }
					</Button>
				) }
				{ ( ! isLoggedIn || ! currentUserSiteCount ) && (
					<GetStartedButton
						plugin={ plugin }
						isMarketplaceProduct={ isMarketplaceProduct }
						onClick={ () => {
							dispatch(
								recordTracksEvent( 'calypso_plugin_details_get_started_click', {
									plugin: plugin?.slug,
									is_logged_in: isLoggedIn,
								} )
							);
						} }
					/>
				) }
			</div>
		);
	}

	// Some plugins can be preinstalled on WPCOM and available as standalone on WPORG,
	// but require a paid upgrade to function.
	if ( selectedSite && isPreinstalledPremiumPlugin ) {
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

	if ( isPluginInstalledOnsiteWithSubscription && sitePlugin ) {
		// Check if already instlaled on the site
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

	return (
		<Fragment>
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<div className="plugin-details-cta__container">
				{ isPluginInstalledOnsite && sitePlugin && (
					<div className="plugin-details-cta__manage-plugin-menu-new-purchase">
						<ManagePluginMenu plugin={ plugin } />
					</div>
				) }
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
												{ price }
												<span className="plugin-details-cta__period">{ period }</span>
											</>
										) : (
											<FreePrice shouldUpgrade={ shouldUpgrade } />
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
						onChange={ onIntervalSwitcherChange }
						plugin={ plugin }
					/>
				) }
				<div className="plugin-details-cta__install">
					<PrimaryButton
						isLoggedIn={ isLoggedIn }
						selectedSite={ selectedSite }
						currentUserSiteCount={ currentUserSiteCount }
						shouldUpgrade={ shouldUpgrade }
						hasEligibilityMessages={ hasEligibilityMessages }
						incompatiblePlugin={ incompatiblePlugin }
						userCantManageTheSite={ userCantManageTheSite }
						translate={ translate }
						plugin={ plugin }
						saasRedirectHRef={ saasRedirectHRef }
						isWpcomStaging={ isWpcomStaging }
						sitesWithPlugins={ sitesWithPlugins }
						installedOnSitesQuantity={ installedOnSitesQuantity }
					/>
				</div>
				{ isDisabledForWpcomStaging && <StagingSiteNotice plugin={ plugin } /> }
				{ ! isJetpackSelfHosted && ! isMarketplaceProduct && (
					<div className="plugin-details-cta__t-and-c">{ getTermsAndConditions() }</div>
				) }
				{ plugin.isSaasProduct && shouldUpgrade && isLoggedIn && selectedSite && (
					<div className="plugin-details-cta__upgrade-required-card">
						<Button
							href={ upgradeToBusinessHref }
							className="plugin-details-cta__install-button"
							primary
							onClick={ () => {} }
						>
							{ translate( 'Upgrade to %(planName)s', {
								args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
							} ) }
						</Button>
					</div>
				) }
			</div>
		</Fragment>
	);
};

function PrimaryButton( {
	isLoggedIn,
	selectedSite,
	currentUserSiteCount,
	shouldUpgrade,
	hasEligibilityMessages,
	incompatiblePlugin,
	userCantManageTheSite,
	translate,
	plugin,
	saasRedirectHRef,
	isWpcomStaging,
	sitesWithPlugins,
	installedOnSitesQuantity,
} ) {
	const dispatch = useDispatch();

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isDisabledForWpcomStaging = isWpcomStaging && isMarketplaceProduct;
	const isIncompatibleForAtomic = isAtomic && 'vaultpress' === plugin.slug;

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_plugin_details_get_started_click', {
				plugin: plugin?.slug,
				is_logged_in: isLoggedIn,
				is_saas_product: plugin?.isSaasProduct,
			} )
		);
	}, [ dispatch, plugin, isLoggedIn ] );

	if ( isLoggedIn && currentUserSiteCount > 0 && sitesWithPlugins.length > 0 && ! selectedSite ) {
		return (
			<ManageSitesButton plugin={ plugin } installedOnSitesQuantity={ installedOnSitesQuantity } />
		);
	}

	if ( ! isLoggedIn || ! selectedSite ) {
		return (
			<GetStartedButton
				onClick={ onClick }
				plugin={ plugin }
				isMarketplaceProduct={ isMarketplaceProduct }
			/>
		);
	}
	if ( plugin.isSaasProduct ) {
		return (
			<Button
				className="plugin-details-cta__install-button"
				primary={ ! shouldUpgrade }
				href={ saasRedirectHRef }
				onClick={ onClick }
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
			disabled={
				incompatiblePlugin ||
				userCantManageTheSite ||
				isDisabledForWpcomStaging ||
				isIncompatibleForAtomic
			}
		/>
	);
}

function GetStartedButton( { onClick, plugin, isMarketplaceProduct, startFreeTrial = false } ) {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );
	const billingPeriod = useSelector( getBillingInterval );
	const buttonText = startFreeTrial
		? translate( 'Start your free trial' )
		: translate( 'Get started' );
	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
			plugin: plugin.slug,
			billing_period: isMarketplaceProduct ? billingPeriod : '',
		},
		startFreeTrial ? 'start/hosting' : '/start/with-plugin'
	);
	return (
		<Button
			type="a"
			className="plugin-details-cta__install-button"
			primary
			onClick={ onClick }
			href={ startUrl }
		>
			{ buttonText }
		</Button>
	);
}

function ManageSitesButton( { plugin, installedOnSitesQuantity } ) {
	const translate = useTranslate();
	const [ displayManageSitePluginsModal, setDisplayManageSitePluginsModal ] = useState( false );
	const isRequestingPlugins = useSelector( ( state ) => isRequestingForAllSites( state ) );

	const toggleDisplayManageSitePluginsModal = useCallback( () => {
		setDisplayManageSitePluginsModal( ( value ) => ! value );
	}, [] );

	return (
		<>
			<ManageSitePluginsDialog
				plugin={ plugin }
				isVisible={ displayManageSitePluginsModal }
				onClose={ () => setDisplayManageSitePluginsModal( false ) }
			/>
			{ !! installedOnSitesQuantity && (
				<div className="plugin-details-cta__installed-text">
					{ translate(
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
			) }
			<Button
				className="plugin-details-cta__manage-button"
				onClick={ toggleDisplayManageSitePluginsModal }
				busy={ isRequestingPlugins }
			>
				{ translate( 'Manage sites' ) }
			</Button>
		</>
	);
}

function FreePrice( { shouldUpgrade } ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedSite = useSelector( getSelectedSite );

	return (
		<>
			{ translate( 'Free' ) }
			{ ( ! isLoggedIn || ! selectedSite || shouldUpgrade ) && (
				<span className="plugin-details-cta__notice">
					{ translate(
						// Translators: %(planName)s is the name of a plan (e.g. Creator or Business)
						'on %(planName)s plan',
						{
							args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
						}
					) }
				</span>
			) }
		</>
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
