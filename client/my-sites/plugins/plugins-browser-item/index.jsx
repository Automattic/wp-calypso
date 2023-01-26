import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getPluginPurchased, getSoftwareSlug } from 'calypso/lib/plugins/utils';
import version_compare from 'calypso/lib/version-compare';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import { useLocalizedPlugins, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import shouldUpgradeCheck from 'calypso/state/marketplace/selectors';
import { getSitesWithPlugin, getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PREINSTALLED_PLUGINS } from '../constants';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';
import PreinstalledPremiumPluginBrowserItemPricing from './preinstalled-premium-plugin-browser-item-pricing';
import { PluginsBrowserElementVariant } from './types';

import './style.scss';

const PluginsBrowserListElement = ( props ) => {
	const {
		isPlaceholder,
		site,
		plugin = {},
		variant = PluginsBrowserElementVariant.Compact,
		currentSites,
	} = props;

	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { localizePath } = useLocalizedPlugins();

	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug || '' )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );
	const sitesWithPlugin = useSelector( ( state ) =>
		currentSites
			? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), softwareSlug )
			: []
	);

	const { isPreinstalledPremiumPluginUpgraded } = usePreinstalledPremiumPlugin( plugin.slug );

	const pluginLink = useMemo( () => {
		if ( plugin.link ) {
			return plugin.link;
		}

		let url = '/plugins/' + plugin.slug;
		if ( site ) {
			url += '/' + site;
		}
		return url;
	}, [ plugin, site ] );

	useEffect(
		function trackPluginItemRender() {
			if ( plugin.railcar ) {
				recordTracksEvent( 'calypso_marketplace_search_traintracks_render', {
					site: site,
					plugin: plugin.slug,
					blog_id: selectedSite?.ID,
					ui_algo: props.listName, // this can also be used to test different layouts eg. list/grid
					ui_position: props.gridPosition,
					...plugin.railcar,
				} );
			}
		},
		[ plugin.railcar ]
	);

	const trackPluginLinkClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_browser_item_click', {
			site: site,
			plugin: plugin.slug,
			list_name: props.listName,
			list_type: props.listType,
			grid_position: props.gridPosition,
			blog_id: selectedSite?.ID,
		} );
		if ( plugin.railcar ) {
			recordTracksEvent( 'calypso_marketplace_search_traintracks_interact', {
				railcar: plugin.railcar.railcar,
				action: 'product_opened',
				blog_id: selectedSite?.ID,
			} );
		}
	}, [ site, plugin, selectedSite, props.listName ] );

	const isWpcomPreinstalled = useMemo( () => {
		if ( plugin.isPreinstalled ) {
			return true;
		}

		if ( ! site ) {
			return false;
		}

		return ! isJetpack && PREINSTALLED_PLUGINS.includes( plugin.slug );
	}, [ isJetpack, site, plugin ] );

	const isPluginInstalledOnSite = useMemo(
		() =>
			selectedSite?.ID &&
			( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) ||
				isWpcomPreinstalled ||
				isPreinstalledPremiumPluginUpgraded ),
		[ selectedSite?.ID, sitesWithPlugin, isWpcomPreinstalled, isPreinstalledPremiumPluginUpgraded ]
	);
	const isUntestedVersion = useMemo( () => {
		const wpVersion = selectedSite?.options?.software_version;
		const pluginTestedVersion = plugin?.tested;

		if ( ! selectedSite?.jetpack || ! wpVersion || ! pluginTestedVersion ) {
			return false;
		}

		return version_compare( wpVersion, pluginTestedVersion, '>' );
	}, [ selectedSite, plugin ] );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const isPluginIncompatible = useMemo( () => {
		return ! isCompatiblePlugin( plugin.slug ) && ! jetpackNonAtomic;
	} );

	const shouldUpgrade = useSelector( ( state ) => shouldUpgradeCheck( state, selectedSite?.ID ) );

	const canInstallPlugins =
		useSelector( ( state ) =>
			siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PLUGINS )
		) || jetpackNonAtomic;

	if ( isPlaceholder ) {
		return <Placeholder variant={ variant } />;
	}

	const classNames = classnames( 'plugins-browser-item', variant, {
		incompatible: isPluginIncompatible,
	} );

	const onClick = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		window.location.href = localizeUrl( 'https://wordpress.com/support/incompatible-plugins/' );
	};

	return (
		<li className={ classNames }>
			<a
				href={ localizePath( pluginLink ) }
				className="plugins-browser-item__link"
				onClick={ trackPluginLinkClick }
			>
				<div className="plugins-browser-item__info">
					<PluginIcon image={ plugin.icon } isPlaceholder={ isPlaceholder } />
					<div className="plugins-browser-item__title">{ plugin.name }</div>
					{ variant === PluginsBrowserElementVariant.Extended && (
						<>
							<div className="plugins-browser-item__author">
								{ translate( 'by ' ) }
								<span className="plugins-browser-item__author-name">{ plugin.author_name }</span>
							</div>
						</>
					) }
					<div className="plugins-browser-item__description">{ plugin.short_description }</div>
				</div>
				{ isUntestedVersion && (
					<div className="plugins-browser-item__untested-notice">
						<Icon size={ 20 } icon={ info } />
						<span className="plugins-browser-item__untested-text">
							{ translate( 'Untested with your version of WordPress' ) }
						</span>
					</div>
				) }
				{ isPluginIncompatible && (
					<span
						role="link"
						tabIndex="-1"
						onClick={ onClick }
						onKeyPress={ onClick }
						className="plugins-browser-item__incompatible"
					>
						{ translate( 'Why is this plugin not compatible with WordPress.com?' ) }
					</span>
				) }
				<div className="plugins-browser-item__footer">
					{ variant === PluginsBrowserElementVariant.Extended && (
						<InstalledInOrPricing
							sitesWithPlugin={ sitesWithPlugin }
							isWpcomPreinstalled={ isWpcomPreinstalled }
							plugin={ plugin }
							shouldUpgrade={ shouldUpgrade }
							canInstallPlugins={ canInstallPlugins }
							currentSites={ currentSites }
						/>
					) }
					{ /* Plugin activation information will be shown in this area if its installed */ }
					{ ! isPluginInstalledOnSite && (
						<div className="plugins-browser-item__additional-info">
							{ !! plugin.rating && (
								<div className="plugins-browser-item__ratings">
									<Gridicon
										size={ 18 }
										icon="star"
										className="plugins-browser-item__rating-star"
										color="#f0b849" // alert-yellow
									/>
									<span className="plugins-browser-item__rating-value">
										{ ( plugin.rating / 20 ).toFixed( 1 ) }
									</span>
									{ Number.isInteger( plugin.num_ratings ) && (
										<span className="plugins-browser-item__number-of-ratings">
											{ translate( '(%(number_of_ratings)s)', {
												args: {
													number_of_ratings: plugin.num_ratings.toLocaleString( getLocaleSlug() ),
												},
											} ) }
										</span>
									) }
								</div>
							) }
						</div>
					) }
				</div>
			</a>
		</li>
	);
};

function InstalledInOrPricing( {
	sitesWithPlugin,
	isWpcomPreinstalled,
	plugin,
	shouldUpgrade,
	canInstallPlugins,
	currentSites,
} ) {
	const translate = useTranslate();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = isMarketplaceProduct ? plugin.software_slug || plugin.org_slug : plugin.slug;
	const isPluginActive = useSelector( ( state ) =>
		getPluginOnSites( state, [ selectedSiteId ], softwareSlug )
	)?.active;
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );
	const { isPreinstalledPremiumPlugin } = usePreinstalledPremiumPlugin( plugin.slug );
	const active = isWpcomPreinstalled || isPluginActive;
	const isPluginActiveOnsiteWithSubscription =
		active && ! isMarketplaceProduct
			? true
			: getPluginPurchased( plugin, purchases, isMarketplaceProduct )?.active;
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( isPreinstalledPremiumPlugin ) {
		return <PreinstalledPremiumPluginBrowserItemPricing plugin={ plugin } />;
	}

	if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || isWpcomPreinstalled ) {
		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className="checkmark" size={ 12 } />
					{ isWpcomPreinstalled || currentSites?.length === 1
						? translate( 'Installed' )
						: translate( 'Installed on %d site', 'Installed on %d sites', {
								args: [ sitesWithPlugin.length ],
								count: sitesWithPlugin.length,
						  } ) }
				</div>
				{ selectedSiteId && (
					<div className="plugins-browser-item__active">
						<Badge type={ isPluginActiveOnsiteWithSubscription ? 'success' : 'info' }>
							{ isPluginActiveOnsiteWithSubscription
								? translate( 'Active' )
								: translate( 'Inactive' ) }
						</Badge>
					</div>
				) }
			</div>
		);
	}

	return (
		<div className="plugins-browser-item__pricing">
			<PluginPrice plugin={ plugin } billingPeriod={ IntervalLength.MONTHLY }>
				{ ( { isFetching, price, period } ) => {
					if ( plugin.isSaasProduct ) {
						// SaaS products do not display a price
						return (
							<>
								{ ! canInstallPlugins && isLoggedIn && (
									<span className="plugins-browser-item__requires-plan-upgrade">
										{ translate( 'Requires a plan upgrade' ) }
									</span>
								) }
							</>
						);
					}
					if ( isFetching ) {
						return <div className="plugins-browser-item__pricing-placeholder">...</div>;
					}
					if ( price ) {
						return (
							<>
								{ price + ' ' }
								<span className="plugins-browser-item__period">{ period }</span>
								{ shouldUpgrade && (
									<div className="plugins-browser-item__period">
										{ translate( 'Requires a plan upgrade' ) }
									</div>
								) }
							</>
						);
					}

					return (
						<>
							{ translate( 'Free' ) }
							{ ! canInstallPlugins && isLoggedIn && (
								<span className="plugins-browser-item__requires-plan-upgrade">
									{ translate( 'Requires a plan upgrade' ) }
								</span>
							) }
						</>
					);
				} }
			</PluginPrice>
		</div>
	);
}

function Placeholder( { variant } ) {
	return (
		<li className={ classnames( 'plugins-browser-item is-placeholder', variant ) }>
			<span className="plugins-browser-item__link">
				<div className="plugins-browser-item__info">
					<PluginIcon isPlaceholder={ true } />
					<div className="plugins-browser-item__title">…</div>
					<div className="plugins-browser-item__author">…</div>
					<div className="plugins-browser-item__description">…</div>
				</div>
			</span>
		</li>
	);
}

export default PluginsBrowserListElement;
