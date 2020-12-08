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

const PREINSTALLED_PLUGINS = [ 'Jetpack by WordPress.com', 'Akismet', 'VaultPress' ];

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

	renderSupportedFlag() {
		if ( ! this.isWpcomPreinstalled() ) {
			return;
		}

		return (
			<div className="plugins-browser-item__supported">
				{ this.props.translate( 'Supported by WordPress.com' ) }
			</div>
		);
	}

	renderInstalledIn() {
		const { sitesWithPlugin } = this.props;
		if ( ( sitesWithPlugin && sitesWithPlugin.length > 0 ) || this.isWpcomPreinstalled() ) {
			return (
				<div className="plugins-browser-item__installed">
					<Gridicon icon="checkmark" size={ 18 } />
					{ this.props.translate( 'Installed' ) }
				</div>
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
						<div className="plugins-browser-item__title-wrapper">
							<div className="plugins-browser-item__title">…</div>
							<div className="plugins-browser-item__description">…</div>
							<div className="plugins-browser-item__author">…</div>
						</div>
						<PluginIcon size={ this.props.iconSize } isPlaceholder={ true } />
					</div>
					<div className="plugins-browser-item__meta is-placeholder">
						<div className="plugins-browser-item__ratings">
							<Rating rating={ 0 } size={ 16 } />
						</div>
					</div>
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
			downloaded = this.props.numberFormat( Math.floor( downloaded / 100000 ) * 100000 ) + '+';
		} else if ( downloaded > 100000 ) {
			downloaded = this.props.numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 0 ) {
			downloaded = this.props.numberFormat( downloaded );
		} else {
			return;
		}

		return (
			<div className="plugins-browser-item__downloads">
				{ this.props.translate( '%(installs)s installs', {
					args: { installs: downloaded },
				} ) }
			</div>
		);
	}

	render() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}
		return (
			<Card className="plugins-browser-item">
				<a
					href={ this.getPluginLink() }
					className="plugins-browser-item__link"
					onClick={ this.trackPluginLinkClick }
				>
					<div className="plugins-browser-item__info">
						<div className="plugins-browser-item__title-wrapper">
							<div className="plugins-browser-item__title">{ this.props.plugin.name }</div>
							<div className="plugins-browser-item__description">
								{ this.props.plugin.short_description }
							</div>
						</div>
						<PluginIcon
							size={ this.props.iconSize }
							image={ this.props.plugin.icon }
							isPlaceholder={ this.props.isPlaceholder }
						/>
					</div>
					<div className="plugins-browser-item__author-wrapper">
						<div className="plugins-browser-item__author">
							{ this.props.translate( 'By {{a}}%(authorName)s{{/a}}', {
								args: { authorName: this.props.plugin.author_name },
								components: { a: <a href={ this.props.plugin.author_url } /> },
							} ) }
						</div>
						{ this.renderSupportedFlag() }
					</div>
					<div className="plugins-browser-item__meta">
						<div className="plugins-browser-item__ratings">
							<Rating rating={ this.props.plugin.rating } size={ 16 } />
							{ this.props.plugin.num_ratings > 0 && (
								<div className="plugins-browser-item__rating-number">
									({ this.props.plugin.num_ratings })
								</div>
							) }
						</div>
						<div className="plugins-browser-item__secondary-meta">
							{ this.renderDownloaded() }
							{ this.renderLastUpdated() }
							{ this.renderInstalledIn() }
						</div>
					</div>
				</a>
				{ this.renderUpgradeButton() }
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
