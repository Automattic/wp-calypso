import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Badge, Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSoftwareSlug } from 'calypso/lib/plugins/utils';
import version_compare from 'calypso/lib/version-compare';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import useAtomicSiteHasEquivalentFeatureToPlugin from 'calypso/my-sites/plugins/use-atomic-site-has-equivalent-feature-to-plugin';
import { useLocalizedPlugins, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import shouldUpgradeCheck from 'calypso/state/marketplace/selectors';
import { getSitesWithPlugin, getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import { setLastVisitedPlugin } from 'calypso/state/plugins/last-visited/actions';
import { isLastVisitedPlugin as getIsLastVisitedPlugin } from 'calypso/state/plugins/last-visited/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	isSaasProduct as isSaasProductSelector,
} from 'calypso/state/products-list/selectors';
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

	const dispatch = useDispatch();
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { localizePath } = useLocalizedPlugins();
	const cardRef = useRef( null );

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

	const onClickItem = useCallback( () => {
		dispatch( setLastVisitedPlugin( plugin.slug, props.listName ) );

		trackPluginLinkClick();
	}, [ trackPluginLinkClick, dispatch, plugin.slug, props.listName ] );

	const isWpcomPreinstalled = useMemo( () => {
		if ( plugin.isPreinstalled ) {
			return true;
		}

		if ( ! site ) {
			return false;
		}

		return ! isJetpack && PREINSTALLED_PLUGINS.includes( plugin.slug );
	}, [ isJetpack, site, plugin ] );

	// Atomic sites already include features such as Jetpack backup, scan, videopress, publicize, and search. So
	// therefore we should prevent users from installing these standalone plugin equivalents.
	const atomicSiteHasEquivalentFeatureToPlugin = useAtomicSiteHasEquivalentFeatureToPlugin(
		plugin.slug
	);

	const isPluginInstalledOnSite = useMemo(
		() =>
			selectedSite?.ID &&
			( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) ||
				isWpcomPreinstalled ||
				isPreinstalledPremiumPluginUpgraded ||
				atomicSiteHasEquivalentFeatureToPlugin ),
		[
			selectedSite?.ID,
			sitesWithPlugin,
			isWpcomPreinstalled,
			isPreinstalledPremiumPluginUpgraded,
			atomicSiteHasEquivalentFeatureToPlugin,
		]
	);

	const isUntestedVersion = useMemo( () => {
		const wpVersion = selectedSite?.options?.software_version;
		const pluginTestedVersion = plugin?.tested;

		if ( ! selectedSite?.jetpack || ! wpVersion || ! pluginTestedVersion ) {
			return false;
		}

		return version_compare( wpVersion, pluginTestedVersion, '>' );
	}, [ selectedSite, plugin ] );

	const isLastVisitedPlugin = useSelector( ( state ) =>
		getIsLastVisitedPlugin( state, plugin.slug, props.listName )
	);

	useEffect( () => {
		if ( isLastVisitedPlugin && cardRef.current ) {
			cardRef.current.scrollIntoView( { behavior: 'auto', block: 'center' } );
		}
	}, [ isLastVisitedPlugin ] );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const isIncompatiblePlugin = useMemo( () => {
		return ! isCompatiblePlugin( plugin.slug ) && ! jetpackNonAtomic;
	}, [ jetpackNonAtomic, plugin.slug ] );

	const isIncompatibleBackupPlugin = useMemo( () => {
		return 'vaultpress' === plugin.slug && ! jetpackNonAtomic;
	}, [ jetpackNonAtomic, plugin.slug ] );

	const shouldUpgrade = useSelector( ( state ) => shouldUpgradeCheck( state, selectedSite?.ID ) );

	const canInstallPlugins =
		useSelector( ( state ) =>
			siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PLUGINS )
		) || jetpackNonAtomic;

	if ( isPlaceholder ) {
		return <Placeholder variant={ variant } />;
	}

	const classNames = clsx( 'plugins-browser-item', variant, {
		incompatible: isIncompatiblePlugin || isIncompatibleBackupPlugin,
	} );

	const onClickIncompatiblePlugin = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		window.location.href = localizeUrl( 'https://wordpress.com/support/incompatible-plugins/' );
	};

	const onClickIncompatibleBackup = ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		page( `/backup/${ site }` );
	};

	return (
		<li className={ classNames }>
			<a
				href={ localizePath( pluginLink ) }
				className="plugins-browser-item__link"
				onClick={ onClickItem }
			>
				<div className="plugins-browser-item__info" ref={ isLastVisitedPlugin ? cardRef : null }>
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
				{ isIncompatiblePlugin && ! isIncompatibleBackupPlugin && (
					<span
						role="link"
						tabIndex="-1"
						onClick={ onClickIncompatiblePlugin }
						onKeyPress={ onClickIncompatiblePlugin }
						className="plugins-browser-item__incompatible"
					>
						{ translate( 'Why is this plugin not compatible with WordPress.com?' ) }
					</span>
				) }
				{ isIncompatibleBackupPlugin && (
					<span
						role="link"
						tabIndex="-1"
						onClick={ onClickIncompatibleBackup }
						onKeyPress={ onClickIncompatibleBackup }
						className="plugins-browser-item__incompatible"
					>
						{ translate( 'Your site plan already includes Jetpack VaultPress Backup.' ) }
					</span>
				) }
				<div className="plugins-browser-item__footer">
					{ variant === PluginsBrowserElementVariant.Extended && (
						<InstalledInOrPricing
							sitesWithPlugin={ sitesWithPlugin }
							isWpcomPreinstalled={ isWpcomPreinstalled }
							atomicSiteHasEquivalentFeatureToPlugin={ atomicSiteHasEquivalentFeatureToPlugin }
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
	atomicSiteHasEquivalentFeatureToPlugin,
	plugin,
	shouldUpgrade,
	canInstallPlugins,
	currentSites,
} ) {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = isMarketplaceProduct ? plugin.software_slug || plugin.org_slug : plugin.slug;
	const isPluginActive = useSelector( ( state ) =>
		getPluginOnSites( state, [ selectedSiteId ], softwareSlug )
	)?.active;
	const { isPreinstalledPremiumPlugin } = usePreinstalledPremiumPlugin( plugin.slug );

	const active = isWpcomPreinstalled || isPluginActive || atomicSiteHasEquivalentFeatureToPlugin;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isSaasProduct = useSelector( ( state ) => isSaasProductSelector( state, plugin.slug ) );

	// is plugin item an already active feature on the site?
	// is atomicSite and is plugin one of the keys of atomicFeaturesIncludedInPluginsMap?
	// return does the site have the feature?

	if ( isPreinstalledPremiumPlugin && ! atomicSiteHasEquivalentFeatureToPlugin ) {
		return <PreinstalledPremiumPluginBrowserItemPricing plugin={ plugin } />;
	}

	if (
		( sitesWithPlugin && sitesWithPlugin.length > 0 ) ||
		isWpcomPreinstalled ||
		atomicSiteHasEquivalentFeatureToPlugin
	) {
		let installedText = '';
		if ( isWpcomPreinstalled || currentSites?.length === 1 ) {
			installedText = translate( 'Installed' );
		} else {
			installedText = translate( 'Installed on %d site', 'Installed on %d sites', {
				args: [ sitesWithPlugin.length ],
				count: sitesWithPlugin.length,
				comment: '%d is the number of sites the user has the plugin installed on.',
			} );
		}
		if ( atomicSiteHasEquivalentFeatureToPlugin ) {
			installedText = translate( 'Included with your plan' );
		}

		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className="checkmark" size={ 12 } />
					{ installedText }
				</div>
				{ selectedSiteId && (
					<div className="plugins-browser-item__active">
						<Badge type={ active ? 'success' : 'info' }>
							{ active ? translate( 'Active' ) : translate( 'Inactive' ) }
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
					if ( isSaasProduct ) {
						// SaaS products displays `Start for free`
						return (
							<>
								{ translate( 'Start for free' ) }
								{ ! canInstallPlugins && isLoggedIn && (
									<div className="plugins-browser-item__period">
										{ translate( 'Requires a plan upgrade' ) }
									</div>
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
								{ translate( '%(price)s {{span}}%(period)s{{/span}}', {
									args: { price, period },
									components: { span: <span className="plugins-browser-item__period" /> },
									comment:
										'Price and period for a plugin, using a span to style the period differently',
								} ) }
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
		<li className={ clsx( 'plugins-browser-item is-placeholder', variant ) }>
			<span className="plugins-browser-item__link">
				<div className="plugins-browser-item__info">
					<PluginIcon isPlaceholder />
					<div className="plugins-browser-item__title">…</div>
					<div className="plugins-browser-item__author">…</div>
					<div className="plugins-browser-item__description">…</div>
				</div>
			</span>
		</li>
	);
}

export default PluginsBrowserListElement;
