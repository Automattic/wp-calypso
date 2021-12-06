import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { includes } from 'lodash';
import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
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
		() => moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow(),
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
							<div className="plugins-browser-item__last-updated">
								{ translate( 'Last updated ' ) }
								<span className="plugins-browser-item__last-updated-value">{ dateFromNow }</span>
							</div>
						</>
					) }
					<div className="plugins-browser-item__description">{ plugin.short_description }</div>
				</div>
				{ variant === PluginsBrowserElementVariant.Extended && (
					<InstalledInOrPricing
						sitesWithPlugin={ sitesWithPlugin }
						isWpcomPreinstalled={ isWpcomPreinstalled }
					/>
				) }
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
				{ props.translate( 'Installed' ) }
			</div>
			/* eslint-enable wpcalypso/jsx-gridicon-size */
		);
	}

	return <div className="plugins-browser-item__pricing">{ translate( 'Free' ) }</div>;
};

const UpgradeButton = ( { plugin } ) => {
	const { isPreinstalled, upgradeLink } = plugin;
	if ( isPreinstalled || ! upgradeLink ) {
		return null;
	}

	return (
		<Button className="plugins-browser-item__upgrade-button" compact primary href={ upgradeLink }>
			{ props.translate( 'Upgrade' ) }
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
