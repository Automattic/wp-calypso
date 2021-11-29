import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose, includes } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getSitesWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PluginsBrowserElementVariant } from './types';

import './style.scss';

const PREINSTALLED_PLUGINS = [ 'Jetpack by WordPress.com', 'Akismet', 'VaultPress' ];

class PluginsBrowserListElement extends Component {
	static defaultProps = {
		iconSize: 40,
		variant: PluginsBrowserElementVariant.Compact,
	};

	getPluginLink() {
		if ( this.props.plugin.link ) {
			return this.props.plugin.link;
		}

		let url = '/plugins/' + this.props.plugin.slug;
		if ( this.props.site ) {
			url += '/' + this.props.site;
		}
		return url;
	}

	trackPluginLinkClick = () => {
		recordTracksEvent( 'calypso_plugin_browser_item_click', {
			site: this.props.site,
			plugin: this.props.plugin.slug,
			list_name: this.props.listName,
		} );
	};

	isWpcomPreinstalled() {
		if ( this.props.plugin.isPreinstalled ) {
			return true;
		}

		if ( ! this.props.site ) {
			return false;
		}

		return ! this.props.isJetpackSite && includes( PREINSTALLED_PLUGINS, this.props.plugin.name );
	}

	renderInstalledInOrPricing() {
		const { sitesWithPlugin, translate } = this.props;
		if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || this.isWpcomPreinstalled() ) {
			return (
				/* eslint-disable wpcalypso/jsx-gridicon-size */
				<div className="plugins-browser-item__installed">
					<Gridicon icon="checkmark" size={ 14 } />
					{ this.props.translate( 'Installed' ) }
				</div>
				/* eslint-enable wpcalypso/jsx-gridicon-size */
			);
		}

		return <div className="plugins-browser-item__pricing">{ translate( 'Free' ) }</div>;
	}

	renderUpgradeButton() {
		const { isPreinstalled, upgradeLink } = this.props.plugin;
		if ( isPreinstalled || ! upgradeLink ) {
			return null;
		}

		return (
			<Button className="plugins-browser-item__upgrade-button" compact primary href={ upgradeLink }>
				{ this.props.translate( 'Upgrade' ) }
			</Button>
		);
	}

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li className="plugins-browser-item is-placeholder">
				<span className="plugins-browser-item__link">
					<div className="plugins-browser-item__info">
						<PluginIcon size={ this.props.iconSize } isPlaceholder={ true } />
						<div className="plugins-browser-item__title">…</div>
						<div className="plugins-browser-item__author">…</div>
						<div className="plugins-browser-item__description">…</div>
					</div>
				</span>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { isPlaceholder, plugin, iconSize, variant, translate } = this.props;
		if ( isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const classNames = classnames( 'plugins-browser-item', variant );

		return (
			<li className={ classNames }>
				<a
					href={ this.getPluginLink() }
					className="plugins-browser-item__link"
					onClick={ this.trackPluginLinkClick }
				>
					<div className="plugins-browser-item__info">
						<PluginIcon size={ iconSize } image={ plugin.icon } isPlaceholder={ isPlaceholder } />
						<div className="plugins-browser-item__title">{ plugin.name }</div>
						{ variant === PluginsBrowserElementVariant.Extended && (
							<div className="plugins-browser-item__author">
								{ translate( 'by ' ) }
								<span className="plugins-browser-item__author-name">{ plugin.author_name }</span>
							</div>
						) }
						<div className="plugins-browser-item__description">{ plugin.short_description }</div>
					</div>
					{ variant === PluginsBrowserElementVariant.Extended && this.renderInstalledInOrPricing() }
				</a>
				{ this.renderUpgradeButton() }
			</li>
		);
	}
}

export default compose(
	connect( ( state, { currentSites, plugin } ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, selectedSiteId );
		const sitesWithPlugin =
			isJetpack && currentSites
				? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), plugin.slug )
				: [];

		return {
			isJetpackSite: isJetpack,
			sitesWithPlugin,
		};
	} ),
	localize
)( PluginsBrowserListElement );
