import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import { includes } from 'lodash';
import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getSitesWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PluginsBrowserElementVariant } from './types';

import './style.scss';

const PREINSTALLED_PLUGINS = [ 'Jetpack by WordPress.com', 'Akismet', 'VaultPress' ];

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

	const selectedSiteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const sitesWithPlugin = useSelector( ( state ) =>
		isJetpack && currentSites
			? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), plugin.slug )
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
	}, [ plugin ] );

	const trackPluginLinkClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_browser_item_click', {
			site: site,
			plugin: plugin.slug,
			list_name: props.listName,
		} );
	}, [ site, plugin, props.listName ] );

	const isWpcomPreinstalled = useMemo( () => {
		if ( plugin.isPreinstalled ) {
			return true;
		}

		if ( ! site ) {
			return false;
		}

		return ! isJetpack && includes( PREINSTALLED_PLUGINS, plugin.name );
	}, [ isJetpack, site, plugin ] );

	if ( isPlaceholder ) {
		return <Placeholder iconSize={ iconSize } />;
	}

	const classNames = classnames( 'plugins-browser-item', variant );
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
							{ dateFromNow && (
								<div className="plugins-browser-item__last-updated">
									{ translate( 'Last updated ' ) }
									<span className="plugins-browser-item__last-updated-value">{ dateFromNow }</span>
								</div>
							) }
						</>
					) }
					<div className="plugins-browser-item__description">{ plugin.short_description }</div>
				</div>
				<div className="plugins-browser-item__footer">
					{ variant === PluginsBrowserElementVariant.Extended && (
						<InstalledInOrPricing
							sitesWithPlugin={ sitesWithPlugin }
							isWpcomPreinstalled={ isWpcomPreinstalled }
						/>
					) }
					<div className="plugins-browser-item__additional-info">
						{ !! plugin.rating && (
							<div className="plugins-browser-item__ratings">
								<PluginRatings
									rating={ plugin.rating }
									inlineNumRatings={
										plugin.rating && Number.isInteger( plugin.num_ratings )
											? plugin.num_ratings.toLocaleString( getLocaleSlug() )
											: null
									}
									hideRatingValue
								/>
							</div>
						) }
						{ !! plugin.active_installs && (
							<div className="plugins-browser-item__active-installs">
								<span className="plugins-browser-item__active-installs-value">{ `${ formatNumberMetric(
									plugin.active_installs
								) }${ plugin.active_installs > 1000 && '+' }` }</span>
								{ translate( ' Active Installs' ) }
							</div>
						) }
					</div>
				</div>
			</a>
			<UpgradeButton plugin={ plugin } />
		</li>
	);
};

const InstalledInOrPricing = ( { sitesWithPlugin, isWpcomPreinstalled } ) => {
	const translate = useTranslate();

	if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || isWpcomPreinstalled ) {
		return (
			/* eslint-disable wpcalypso/jsx-gridicon-size */
			<div className="plugins-browser-item__installed">
				<Gridicon icon="checkmark" size={ 14 } />
				{ translate( 'Installed' ) }
			</div>
			/* eslint-enable wpcalypso/jsx-gridicon-size */
		);
	}

	return <div className="plugins-browser-item__pricing">{ translate( 'Free' ) }</div>;
};

const UpgradeButton = ( { plugin } ) => {
	const translate = useTranslate();
	const { isPreinstalled, upgradeLink } = plugin;

	if ( isPreinstalled || ! upgradeLink ) {
		return null;
	}

	return (
		<Button className="plugins-browser-item__upgrade-button" compact primary href={ upgradeLink }>
			{ translate( 'Upgrade' ) }
		</Button>
	);
};

const Placeholder = ( { iconSize } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
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
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default PluginsBrowserListElement;
