/* eslint-disable wpcalypso/jsx-classname-namespace */
import config from '@automattic/calypso-config';
import {
	isFreePlanProduct,
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { Gridicon, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userCan } from 'calypso/lib/site/utils';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { ManageSitePluginsDialog } from 'calypso/my-sites/plugins/manage-site-plugins-dialog';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import {
	isRequestingForSites,
	getSiteObjectsWithPlugin,
	getPluginOnSite,
} from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { PREINSTALLED_PLUGINS } from '../constants';
import { PluginPrice } from '../plugin-price';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';
import CTAButton from './CTA-button';
import { ActivationButton } from './activation-button';
import { ManagePluginMenu } from './manage-plugin-menu';
import PluginDetailsCTAPreinstalledPremiumPlugins from './preinstalled-premium-plugins-CTA';
import USPS from './usps';
import './style.scss';

const PluginDetailsCTA = ( props ) => {
	const {
		plugin,
		selectedSite,
		isPluginInstalledOnsite,
		siteIds,
		isPlaceholder,
		billingPeriod,
		isMarketplaceProduct,
		isSiteConnected,
	} = props;

	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	const pluginSlug = plugin.slug;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ displayManageSitePluginsModal, setDisplayManageSitePluginsModal ] = useState( false );

	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);

	// Site type
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;
	const incompatiblePlugin = ! isJetpackSelfHosted && ! isCompatiblePlugin( pluginSlug );
	const userCantManageTheSite = ! userCan( 'manage_options', selectedSite );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, pluginSlug )
	);

	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	const installedOnSitesQuantity = sitesWithPlugin.length;

	// Eligibilities for Simple Sites.
	// eslint-disable-next-line prefer-const
	let { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);

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
			<div className="plugin-details-CTA__container">
				<div className="plugin-details-CTA__price">{ translate( 'Free' ) }</div>
				<span className="plugin-details-CTA__preinstalled">
					{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }
				</span>
			</div>
		);
	}

	// Some plugins can be preinstalled on WPCOM and available as standalone on WPORG,
	// but require a paid upgrade to function.
	if ( isPreinstalledPremiumPlugin ) {
		return (
			<div className="plugin-details-CTA__container">
				<PluginDetailsCTAPreinstalledPremiumPlugins
					isPluginInstalledOnsite={ isPluginInstalledOnsite }
					plugin={ plugin }
				/>
			</div>
		);
	}

	if ( isPlaceholder || requestingPluginsForSites ) {
		return <PluginDetailsCTAPlaceholder />;
	}

	if ( legacyVersion ) {
		return <LegacyPluginDetailsCTA { ...props } />;
	}

	if ( isPluginInstalledOnsite && sitePlugin ) {
		// Check if already instlaled on the site
		const activeText = translate( '{{span}}active{{/span}}', {
			components: {
				span: <span className="plugin-details-CTA__installed-text-active"></span>,
			},
		} );
		const inactiveText = translate( '{{span}}deactivated{{/span}}', {
			components: {
				span: <span className="plugin-details-CTA__installed-text-inactive"></span>,
			},
		} );
		const { active } = sitePlugin;

		return (
			<div className="plugin-details-CTA__container">
				<div className="plugin-details-CTA__container-header">
					<div className="plugin-details-CTA__installed-text">
						{ translate( 'Installed and {{activation /}}', {
							components: {
								activation: active ? activeText : inactiveText,
							},
						} ) }
					</div>
					<div className="plugin-details-CTA__manage-plugin-menu">
						<ManagePluginMenu plugin={ plugin } />
					</div>
				</div>

				<ActivationButton plugin={ plugin } active={ active } />

				<PluginAutoupdateToggle
					site={ selectedSite }
					plugin={ sitePlugin }
					label={
						<span className="plugin-details-CTA__autoupdate-text">
							<span className="plugin-details-CTA__autoupdate-text-main">
								{ translate( 'Enable autoupdates.' ) }
							</span>
							{ sitePlugin.version && (
								<span className="plugin-details-CTA__autoupdate-text-version">
									{ translate( ' Currently %(version)s', {
										args: { version: sitePlugin.version },
									} ) }
								</span>
							) }
						</span>
					}
					isMarketplaceProduct={ plugin.isMarketplaceProduct }
					wporg
				/>
			</div>
		);
	}

	if ( ! selectedSite && isLoggedIn ) {
		// Check if there is no site selected
		return (
			<div className="plugin-details-CTA__container">
				<ManageSitePluginsDialog
					plugin={ plugin }
					isVisible={ displayManageSitePluginsModal }
					onClose={ () => setDisplayManageSitePluginsModal( false ) }
				/>
				<div className="plugin-details-CTA__installed-text">
					{ !! installedOnSitesQuantity &&
						translate(
							'Installed on {{span}}%d site{{/span}}',
							'Installed on {{span}}%d sites{{/span}}',
							{
								args: [ installedOnSitesQuantity ],
								installedOnSitesQuantity,
								components: {
									span: <span className="plugin-details-CTA__installed-text-quantity"></span>,
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
		<div className="plugin-details-CTA__container">
			<div className="plugin-details-CTA__price">
				<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
					{ ( { isFetching, price, period } ) =>
						isFetching ? (
							<div className="plugin-details-CTA__price-placeholder">...</div>
						) : (
							<>
								{ price ? (
									<>
										{ price + ' ' }
										<span className="plugin-details-CTA__period">{ period }</span>
									</>
								) : (
									translate( 'Free' )
								) }
							</>
						)
					}
				</PluginPrice>
			</div>
			{ isMarketplaceProduct && (
				<BillingIntervalSwitcher
					billingPeriod={ billingPeriod }
					onChange={ ( interval ) => dispatch( setBillingInterval( interval ) ) }
					plugin={ plugin }
				/>
			) }
			<div className="plugin-details-CTA__install">
				{ isLoggedIn ? (
					<CTAButton
						plugin={ plugin }
						isPluginInstalledOnsite={ isPluginInstalledOnsite }
						isJetpackSelfHosted={ isJetpackSelfHosted }
						selectedSite={ selectedSite }
						hasEligibilityMessages={ hasEligibilityMessages }
						isMarketplaceProduct={ isMarketplaceProduct }
						billingPeriod={ billingPeriod }
						shouldUpgrade={ shouldUpgrade }
						isSiteConnected={ isSiteConnected }
						disabled={ incompatiblePlugin || userCantManageTheSite }
					/>
				) : (
					<Button
						type="a"
						className="plugin-details-CTA__install-button"
						primary
						href={ localizeUrl( 'https://wordpress.com/pricing/' ) }
					>
						{ translate( 'View plans' ) }
					</Button>
				) }
			</div>
			{ ! isJetpackSelfHosted && ! isMarketplaceProduct && (
				<div className="plugin-details-CTA__t-and-c">
					{ translate(
						'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
						{
							components: {
								a: (
									<a target="_blank" rel="noopener noreferrer" href="https://wordpress.com/tos/" />
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
			{ shouldUpgrade && isLoggedIn && (
				<div className="plugin-details-CTA__upgrade-required">
					<span className="plugin-details-CTA__upgrade-required-icon">
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="notice-outline" size={ 20 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
					</span>
					<span className="plugin-details-CTA__upgrade-required-text">
						{ translate( 'You need to upgrade your plan to install plugins.' ) }
					</span>
				</div>
			) }
		</div>
	);
};

function LegacyPluginDetailsCTA( {
	plugin,
	selectedSite,
	isPluginInstalledOnsite,
	siteIds,
	billingPeriod,
	isMarketplaceProduct,
	isSiteConnected,
} ) {
	const pluginSlug = plugin.slug;
	const translate = useTranslate();

	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);

	// Site type
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const isFreePlan = selectedSite && isFreePlanProduct( selectedSite.plan );
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;

	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	// Eligibilities for Simple Sites.
	// eslint-disable-next-line prefer-const
	let { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);

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

	if ( requestingPluginsForSites ) {
		// Display nothing if we are still requesting the plugin status.
		return null;
	}
	if ( ! isJetpackSelfHosted && ! isCompatiblePlugin( pluginSlug ) ) {
		// Check for WordPress.com compatibility.
		return null;
	}

	// Check if user can manage plugins or no site is selected (all sites view).
	if ( ! selectedSite || ! userCan( 'manage_options', selectedSite ) ) {
		if ( isMarketplaceProduct ) {
			return (
				<div className="plugin-details-CTA__container">
					<div className="plugin-details-CTA__price align-right">
						<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
							{ ( { isFetching, price, period } ) =>
								isFetching ? (
									<div className="plugin-details-CTA__price-placeholder">...</div>
								) : (
									<>
										{ price + ' ' }
										<span className="plugin-details-CTA__period">{ period }</span>
									</>
								)
							}
						</PluginPrice>
						{ selectedSite && shouldUpgrade && (
							<span className="plugin-details-CTA__uprade-required">
								{ translate( 'Plan upgrade required' ) }
							</span>
						) }
					</div>
				</div>
			);
		}
		return null;
	}

	if ( isPluginInstalledOnsite ) {
		// Check if already instlaled on the site
		return null;
	}

	return (
		<div className="plugin-details-CTA__container">
			<div className="plugin-details-CTA__price">
				<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
					{ ( { isFetching, price, period } ) =>
						isFetching ? (
							<div className="plugin-details-CTA__price-placeholder">...</div>
						) : (
							<>
								{ price ? (
									<>
										{ price + ' ' }
										<span className="plugin-details-CTA__period">{ period }</span>
									</>
								) : (
									translate( 'Free' )
								) }
								{ shouldUpgrade && (
									<span className="plugin-details-CTA__uprade-required">
										{ translate( 'Plan upgrade required' ) }
									</span>
								) }
							</>
						)
					}
				</PluginPrice>
			</div>
			<div className="plugin-details-CTA__install">
				<CTAButton
					plugin={ plugin }
					isPluginInstalledOnsite={ isPluginInstalledOnsite }
					isJetpackSelfHosted={ isJetpackSelfHosted }
					selectedSite={ selectedSite }
					hasEligibilityMessages={ hasEligibilityMessages }
					isMarketplaceProduct={ isMarketplaceProduct }
					billingPeriod={ billingPeriod }
					shouldUpgrade={ shouldUpgrade }
					isSiteConnected={ isSiteConnected }
				/>
			</div>
			{ ! isJetpackSelfHosted && ! isMarketplaceProduct && (
				<div className="plugin-details-CTA__t-and-c">
					{ translate(
						'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the {{thirdPartyTos}}Third-Party plugin Terms{{/thirdPartyTos}}.',
						{
							components: {
								a: (
									<a target="_blank" rel="noopener noreferrer" href="https://wordpress.com/tos/" />
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

			{ ! isJetpackSelfHosted && (
				<USPS
					shouldUpgrade={ shouldUpgrade }
					isFreePlan={ isFreePlan }
					isMarketplaceProduct={ isMarketplaceProduct }
					billingPeriod={ billingPeriod }
				/>
			) }
		</div>
	);
}

function PluginDetailsCTAPlaceholder() {
	return (
		<div className="plugin-details-CTA__container is-placeholder">
			<div className="plugin-details-CTA__price">...</div>
			<div className="plugin-details-CTA__install">...</div>
			<div className="plugin-details-CTA__t-and-c">...</div>
		</div>
	);
}

export default PluginDetailsCTA;
