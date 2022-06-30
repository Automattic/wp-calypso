import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
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
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import shouldUpgradeCheck from 'calypso/state/marketplace/selectors';
import { getSitesWithPlugin, getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PREINSTALLED_PLUGINS } from '../constants';
import { PluginsBrowserElementVariant } from './types';

import './style.scss';

const PluginsBrowserListElement = ( props ) => {
	const {
		isPlaceholder,
		site,
		plugin = {},
		iconSize = 40,
		variant = PluginsBrowserElementVariant.Compact,
		currentSites,
	} = props;

	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const localizeUrl = useLocalizeUrl();

	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const sitesWithPlugin = useSelector( ( state ) =>
		currentSites
			? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), plugin.slug )
			: []
	);
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug || '' )
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

	const trackPluginLinkClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_browser_item_click', {
			site: site,
			plugin: plugin.slug,
			list_name: props.listName,
			grid_position: props.gridPosition,
			blog_id: selectedSite?.ID,
		} );
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

	const shouldUpgradeToInstallPurchasedPlugins = useSelector( ( state ) =>
		shouldUpgradeCheck( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);

	const shouldUpgradeToManagePlugins = useSelector( ( state ) =>
		shouldUpgradeCheck( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS )
	);

	if ( isPlaceholder ) {
		// eslint-disable-next-line no-use-before-define
		return <Placeholder iconSize={ iconSize } />;
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
				href={ pluginLink }
				className="plugins-browser-item__link"
				onClick={ trackPluginLinkClick }
			>
				<div className="plugins-browser-item__info">
					<PluginIcon size={ iconSize } image={ plugin.icon } isPlaceholder={ isPlaceholder } />
					<div className="plugins-browser-item__title">{ plugin.name }</div>
					{ variant === PluginsBrowserElementVariant.Extended && (
						<>
							<div className="plugins-browser-item__author">
								{ translate( 'by ' ) }
								<span className="plugins-browser-item__author-name">{ plugin.author_name }</span>
							</div>

							<div className="plugins-browser-item__last-updated">
								{ dateFromNow && (
									<>
										{ translate( 'Last updated ' ) }
										<span className="plugins-browser-item__last-updated-value">
											{ dateFromNow }
										</span>
									</>
								) }
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
						// eslint-disable-next-line no-use-before-define
						<InstalledInOrPricing
							sitesWithPlugin={ sitesWithPlugin }
							isWpcomPreinstalled={ isWpcomPreinstalled }
							plugin={ plugin }
							shouldUpgradeToInstallPurchasedPlugins={ shouldUpgradeToInstallPurchasedPlugins }
							shouldUpgradeToManagePlugins={ shouldUpgradeToManagePlugins }
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
	shouldUpgradeToInstallPurchasedPlugins,
	shouldUpgradeToManagePlugins,
	currentSites,
} ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isPluginAtive = useSelector( ( state ) =>
		getPluginOnSites( state, [ selectedSiteId ], plugin.slug )
	)?.active;
	const active = isWpcomPreinstalled || isPluginAtive;

	let checkmarkColorClass = 'checkmark--active';

	if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || isWpcomPreinstalled ) {
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		if ( selectedSiteId ) {
			checkmarkColorClass = active ? 'checkmark--active' : 'checkmark--inactive';
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
						<Badge type={ active ? 'success' : 'info' }>
							{ active ? translate( 'Active' ) : translate( 'Inactive' ) }
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
									{ shouldUpgradeToInstallPurchasedPlugins && (
										<div className="plugins-browser-item__period">
											{ translate( 'Requires a plan upgrade' ) }
										</div>
									) }
								</>
							) : (
								<>
									{ translate( 'Free' ) }
									{ shouldUpgradeToManagePlugins && (
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

const Placeholder = ( { iconSize } ) => {
	return (
		<li className="plugins-browser-item is-placeholder">
			<span className="plugins-browser-item__link">
				<div className="plugins-browser-item__info">
					<PluginIcon size={ iconSize } isPlaceholder={ true } />
					<div className="plugins-browser-item__title">…</div>
					<div className="plugins-browser-item__author">…</div>
					<div className="plugins-browser-item__description">…</div>
				</div>
			</span>
		</li>
	);
};

export default PluginsBrowserListElement;
