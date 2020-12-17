/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { flowRight as compose, includes } from 'lodash';

/**
 * Internal dependencies
 */
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { Button, Card } from '@automattic/components';
import Rating from 'calypso/components/rating';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSitesWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const PREINSTALLED_PLUGINS = [
	'Jetpack by WordPress.com',
	'Akismet Spam Protection',
	'VaultPress',
];

class PluginsBrowserListElement extends Component {
	static defaultProps = {
		iconSize: 40,
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

	isWpcomSupported() {
		const { site, plugin } = this.props;

		if ( ! site ) {
			return false;
		}

		return (
			( ! this.props.isJetpackSite && 'Automattic' === plugin.author_name ) ||
			'WooCommerce' === plugin.author_name
		);
	}

	renderSupportedFlag() {
		if ( ! this.isWpcomSupported() ) {
			return;
		}

		return (
			<div className="plugins-browser-item__support">
				{ this.props.translate( 'Support by WordPress.com' ) }
			</div>
		);
	}

	renderInstalledIn() {
		const { sitesWithPlugin } = this.props;
		if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || this.isWpcomPreinstalled() ) {
			return (
				<Button className="plugins-browser-item__installed" compact>
					<Gridicon icon="checkmark" size={ 18 } />
					{ this.props.translate( 'Installed' ) }
				</Button>
			);
		}
		return null;
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
			<Card className="plugins-browser-item is-placeholder">
				<span className="plugins-browser-item__link">
					<div className="plugins-browser-item__info">
						<PluginIcon size={ this.props.iconSize } isPlaceholder={ true } />
						<div className="plugins-browser-item__title-wrapper">
							<div className="plugins-browser-item__title">…</div>
							<div className="plugins-browser-item__description">…</div>
							<div className="plugins-browser-item__author">…</div>
						</div>
					</div>
					{ this.props.showMeta && (
						<div className="plugins-browser-item__meta is-placeholder">
							<div className="plugins-browser-item__ratings">
								<Rating rating={ 0 } size={ 16 } />
							</div>
						</div>
					) }
				</span>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderLastUpdated = () => {
		const { plugin, moment } = this.props;

		if ( plugin && plugin.last_updated ) {
			const dateFromNow = moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow();

			return (
				<div className="plugins-browser-item__last-updated">
					{ this.props.translate( 'Updated %(dateFromNow)s', { args: { dateFromNow } } ) }
				</div>
			);
		}
	};

	renderDownloaded() {
		let downloaded = this.props.plugin.downloaded;
		if ( downloaded > 1000000 ) {
			downloaded = this.props.translate( '%(installs)sM+ installs', {
				args: { installs: this.props.numberFormat( Math.floor( downloaded / 1000000 ) ) },
			} );
		} else if ( downloaded > 1000 ) {
			downloaded = this.props.translate( '%(installs)sK+ installs', {
				args: { installs: this.props.numberFormat( Math.floor( downloaded / 1000 ) ) },
			} );
		} else if ( downloaded > 0 ) {
			downloaded = this.props.translate( '%(installs)s installs', {
				args: { installs: this.props.numberFormat( downloaded ) },
			} );
		} else {
			return;
		}

		return <div className="plugins-browser-item__downloads">{ downloaded }</div>;
	}

	render() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}
		const { plugin, iconSize, isPlaceholder, showMeta } = this.props;
		return (
			<Card className="plugins-browser-item">
				<a
					href={ this.getPluginLink() }
					className="plugins-browser-item__link"
					onClick={ this.trackPluginLinkClick }
				>
					<div className="plugins-browser-item__info">
						<PluginIcon size={ iconSize } image={ plugin.icon } isPlaceholder={ isPlaceholder } />
						<div className="plugins-browser-item__title-wrapper">
							<div className="plugins-browser-item__title">{ plugin.name }</div>
							<div className="plugins-browser-item__author-wrapper">
								<div className="plugins-browser-item__author">
									<a href={ plugin.author_url }>{ plugin.author_name }</a>
								</div>
								{ this.renderSupportedFlag() }
							</div>
							<div className="plugins-browser-item__description">{ plugin.short_description }</div>
						</div>
					</div>
					{ showMeta && (
						<div className="plugins-browser-item__meta">
							<div className="plugins-browser-item__ratings">
								<Rating rating={ plugin.rating } size={ 16 } />
							</div>
							{ this.renderDownloaded() }
							{ this.renderLastUpdated() }
							{ this.renderInstalledIn() }
							{ this.renderUpgradeButton() }
						</div>
					) }
				</a>
			</Card>
		);
	}
}

export default compose(
	connect( ( state, { currentSites, plugin, site } ) => {
		const selectedSiteId = getSelectedSiteId( state );

		const sitesWithPlugin =
			site && currentSites
				? getSitesWithPlugin( state, siteObjectsToSiteIds( currentSites ), plugin.slug )
				: [];

		return {
			isJetpackSite: isJetpackSite( state, selectedSiteId ),
			sitesWithPlugin,
		};
	} ),
	withLocalizedMoment,
	localize
)( PluginsBrowserListElement );
