import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import PluginUpdateIndicator from 'calypso/my-sites/plugins/plugin-site-update-indicator';
import {
	getPluginOnSite,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';

import './style.scss';

const PluginSiteJetpack = ( { isAutoManaged = false, site, plugin, allowedActions, ...props } ) => {
	const translate = useTranslate();
	const {
		activation: canToggleActivation = true,
		autoupdate: canToggleAutoupdate = true,
		remove: canToggleRemove = true,
	} = allowedActions;

	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site.ID, plugin.slug ) );
	const settingsLink = pluginOnSite?.action_links?.Settings ?? null;
	const installInProgress = useSelector( ( state ) =>
		isPluginActionInProgress( state, site.ID, plugin.id, INSTALL_PLUGIN )
	);
	const [ isMobileLayout, setIsMobileLayout ] = useState();
	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );
	const currentPurchase =
		plugin.isMarketplaceProduct &&
		purchases.find( ( purchase ) =>
			Object.values( plugin?.variations ).some(
				( variation ) => variation.product_slug === purchase.productSlug
			)
		);

	useEffect( () => {
		if ( isWithinBreakpoint( '<1040px' ) ) {
			setIsMobileLayout( true );
		}
		const unsubscribe = subscribeIsWithinBreakpoint( '<1040px', ( isMobile ) =>
			setIsMobileLayout( isMobile )
		);

		return () => {
			if ( typeof unsubscribe === 'function' ) {
				unsubscribe();
			}
		};
	}, [] );

	if ( ! site || ! plugin ) {
		return null;
	}

	if ( ! pluginOnSite ) {
		return (
			<div className="plugin-site-jetpack__container">
				<div className="plugin-site-jetpack__domain">{ site.domain }</div>
				<div className="plugin-site-jetpack__install-button">
					{
						<PluginInstallButton
							isEmbed={ true }
							selectedSite={ site }
							plugin={ plugin }
							isInstalling={ installInProgress }
							{ ...props }
						/>
					}
				</div>
			</div>
		);
	}

	return (
		<>
			{ plugin.isMarketplaceProduct && <QuerySitePurchases siteId={ site.ID } /> }
			<div className="plugin-site-jetpack__container">
				<div className="plugin-site-jetpack__domain">
					{ site.domain }
					{ ( isAutoManaged || plugin.isMarketplaceProduct ) && (
						<div className="plugin-site-jetpack__automanage-notice">
							{ translate( 'Auto-managed on this site' ) }
						</div>
					) }
				</div>
				{ canToggleActivation && (
					<PluginActivateToggle
						site={ site }
						plugin={ pluginOnSite }
						hideLabel={ ! isMobileLayout }
					/>
				) }
				{ canToggleAutoupdate && (
					<PluginAutoupdateToggle
						site={ site }
						plugin={ pluginOnSite }
						wporg={ true }
						hideLabel={ ! isMobileLayout }
						toggleExtraContent={
							! isMobileLayout && <PluginUpdateIndicator site={ site } plugin={ plugin } expanded />
						}
						isMarketplaceProduct={ plugin.isMarketplaceProduct }
					/>
				) }

				<div className="plugin-site-jetpack__action plugin-action last-actions">
					{ ! isMobileLayout && canToggleRemove && (
						<PluginRemoveButton
							plugin={ pluginOnSite }
							site={ site }
							isMarketplaceProduct={ plugin.isMarketplaceProduct }
						/>
					) }
					{ ( isMobileLayout || settingsLink || currentPurchase ) && (
						<EllipsisMenu position={ 'bottom' }>
							{ currentPurchase?.id && (
								<PopoverMenuItem
									icon="credit-card"
									href={ `/me/purchases/${ site.domain }/${ currentPurchase.id }` }
								>
									{ translate( 'Manage Subscription' ) }
								</PopoverMenuItem>
							) }
							{ settingsLink && (
								<PopoverMenuItem icon="cog" href={ settingsLink }>
									{ translate( 'Settings' ) }
								</PopoverMenuItem>
							) }
							{ isMobileLayout && (
								<>
									<PluginUpdateIndicator
										site={ site }
										plugin={ plugin }
										expanded
										menuItem
										isMarketplaceProduct={ plugin.isMarketplaceProduct }
									/>
									<PluginRemoveButton
										plugin={ pluginOnSite }
										site={ site }
										menuItem
										isMarketplaceProduct={ plugin.isMarketplaceProduct }
									/>
								</>
							) }
						</EllipsisMenu>
					) }
				</div>
			</div>
		</>
	);
};

PluginSiteJetpack.propTypes = {
	site: PropTypes.object,
	plugin: PropTypes.object,
	allowedActions: PropTypes.shape( {
		activation: PropTypes.bool,
		autoupdate: PropTypes.bool,
		remove: PropTypes.bool,
	} ),
	isAutoManaged: PropTypes.bool,
};

PluginSiteJetpack.defaultProps = {
	allowedActions: {
		activation: true,
		autoupdate: true,
		remove: true,
	},
	isAutoManaged: false,
};

export default PluginSiteJetpack;
