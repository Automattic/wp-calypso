import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { TextHighlight } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import version_compare from 'calypso/lib/version-compare';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
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
		search,
	} = props;

	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const localizeUrl = useLocalizeUrl();
	const { localizePath } = useLocalizedPlugins();

	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug || '' )
	);
	const softwareSlug = isMarketplaceProduct ? plugin.software_slug || plugin.org_slug : plugin.slug;
	const sitesWithPlugin = useSelector( ( state ) =>
		currentSites
			? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), softwareSlug )
			: []
	);

	const dateFromNow = useMemo(
		() =>
			plugin.last_updated ? moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow() : null,
		[ plugin.last_updated ]
	);

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
		// eslint-disable-next-line no-use-before-define
		return <Placeholder />;
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
					<div className="plugins-browser-item__title">
						<TextHighlight text={ plugin.name } highlight={ search } />
					</div>
					{ variant === PluginsBrowserElementVariant.Extended && (
						<>
							<div className="plugins-browser-item__author">
								{ translate( 'by ' ) }
								<span className="plugins-browser-item__author-name">
									<TextHighlight text={ plugin.author_name } highlight={ search } />
								</span>
							</div>

							<div className="plugins-browser-item__last-updated">
								{ dateFromNow &&
									translate( 'Last updated {{span}}%(ago)s{{/span}}', {
										args: {
											ago: dateFromNow,
										},
										components: {
											span: <span className="plugins-browser-item__last-updated-value" />,
										},
									} ) }
							</div>
						</>
					) }
					<div className="plugins-browser-item__description">
						<TextHighlight text={ plugin.short_description } highlight={ search } />
					</div>
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
						// eslint-disable-next-line no-use-before-define
						<InstalledInOrPricing
							sitesWithPlugin={ sitesWithPlugin }
							isWpcomPreinstalled={ isWpcomPreinstalled }
							plugin={ plugin }
							shouldUpgrade={ shouldUpgrade }
							canInstallPlugins={ canInstallPlugins }
							currentSites={ currentSites }
						/>
					) }
					<div className="plugins-browser-item__additional-info">
						{ !! plugin.rating && ! isMarketplaceProduct && (
							<div className="plugins-browser-item__ratings">
								<PluginRatings
									rating={ plugin.rating }
									numRatings={ plugin.num_ratings }
									inlineNumRatings
									hideRatingNumber
								/>
							</div>
						) }
						{ !! plugin.active_installs && (
							<div className="plugins-browser-item__active-installs">
								<span className="plugins-browser-item__active-installs-value">{ `${ formatNumberMetric(
									plugin.active_installs,
									0
								) }${ plugin.active_installs > 1000 ? '+' : '' }` }</span>
								{ translate( ' Active Installs' ) }
							</div>
						) }
					</div>
				</div>
			</a>
		</li>
	);
};

const InstalledInOrPricing = ( {
	sitesWithPlugin,
	isWpcomPreinstalled,
	plugin,
	shouldUpgrade,
	canInstallPlugins,
	currentSites,
} ) => {
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

	const currentPurchase =
		isMarketplaceProduct &&
		purchases.find( ( purchase ) =>
			Object.values( plugin?.variations ).some(
				( variation ) => variation.product_id === purchase.productId
			)
		);
	const { isPreinstalledPremiumPlugin } = usePreinstalledPremiumPlugin( plugin.slug );
	const active = isWpcomPreinstalled || isPluginActive;
	const isPluginActiveOnsiteWithSubscription =
		active && ! isMarketplaceProduct ? true : currentPurchase?.active;
	const isLoggedIn = useSelector( isUserLoggedIn );
	let checkmarkColorClass = 'checkmark--active';

	if ( isPreinstalledPremiumPlugin ) {
		return <PreinstalledPremiumPluginBrowserItemPricing plugin={ plugin } />;
	}

	if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || isWpcomPreinstalled ) {
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		if ( selectedSiteId ) {
			checkmarkColorClass = isPluginActiveOnsiteWithSubscription
				? 'checkmark--active'
				: 'checkmark--inactive';
		}
		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className={ checkmarkColorClass } size={ 14 } />
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
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}

	return (
		<div className="plugins-browser-item__pricing">
			<PluginPrice plugin={ plugin } billingPeriod={ IntervalLength.MONTHLY }>
				{ ( { isFetching, price, period } ) =>
					isFetching ? (
						<div className="plugins-browser-item__pricing-placeholder">...</div>
					) : (
						<>
							{ price ? (
								<>
									{ price + ' ' }
									<span className="plugins-browser-item__period">{ period }</span>
									{ shouldUpgrade && (
										<div className="plugins-browser-item__period">
											{ translate( 'Requires a plan upgrade' ) }
										</div>
									) }
								</>
							) : (
								<>
									{ translate( 'Free' ) }
									{ ! canInstallPlugins && isLoggedIn && (
										<span className="plugins-browser-item__requires-plan-upgrade">
											{ translate( 'Requires a plan upgrade' ) }
										</span>
									) }
								</>
							) }
						</>
					)
				}
			</PluginPrice>
		</div>
	);
};

const Placeholder = () => {
	return (
		<li className="plugins-browser-item is-placeholder">
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
};

export default PluginsBrowserListElement;
