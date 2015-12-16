/**
 * External dependencies
 */
import React from 'react';
import i18n from 'lib/mixins/i18n';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import Version from 'components/version';
import PluginRatings from 'my-sites/plugins/plugin-ratings/';
import versionCompare from 'lib/version-compare';
import analytics from 'analytics';

export default React.createClass( {
	_WPORG_PLUGINS_URL: 'wordpress.org/plugins/',

	displayName: 'PluginInformation',

	propTypes: {
		plugin: React.PropTypes.object.isRequired,
		isPlaceholder: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			plugin: {
				rating: 0,
			}
		};
	},

	renderHomepageLink() {
		if ( ! this.props.plugin || ! this.props.plugin.plugin_url ) {
			return;
		}

		// Does the plugin_url point to .org page
		if ( this.props.plugin.plugin_url.search( this._WPORG_PLUGINS_URL + this.props.plugin.slug ) !== -1 ) {
			return;
		}

		return (
			<ExternalLink
				icon={ true }
				href={ this.props.plugin.plugin_url }
				onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked Plugin Homepage Link', 'Plugin Name', this.props.plugin.slug ) }
				className="plugin-information__external-link"
			>
				{ this.translate( 'Plugin homepage' ) }
			</ExternalLink>
		);
	},

	renderWporgLink() {
		if ( ! this.props.plugin.slug ) {
			return;
		}
		return (
			<ExternalLink
				icon={ true }
				href={ 'https://' + this._WPORG_PLUGINS_URL + this.props.plugin.slug + '/' }
				onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked wp.org Plugin Link', 'Plugin Name', this.props.plugin.slug ) }
				className="plugin-information__external-link"
			>
				{ this.translate( 'WordPress.org Plugin page' ) }
			</ExternalLink>
		);
	},

	renderWPCOMPluginSupportLink() {
		if ( ! this.props.plugin || ! this.props.plugin.support_URL ) {
			return;
		}

		return (
			<ExternalLink
				icon={ true }
				href={ this.props.plugin.support_URL }
				onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked Plugin Homepage Link', 'Plugin Name', this.props.plugin.slug ) }
				className="plugin-information__external-link"
			>
				{ this.translate( 'Learn More' ) }
			</ExternalLink>
		);
	},

	renderLastUpdated() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			const dateFromNow = i18n.moment.utc( this.props.plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow();
			const syncIcon = this.props.hasUpdate ? <Gridicon icon="sync" size={ 18 } /> : null;

			return <div className="plugin-information__last-updated">
				{ this.translate( 'Released %(dateFromNow)s', { args: { dateFromNow } } ) }
				{ syncIcon }
			</div>;
		}
	},

	renderSiteVersion() {
		return this.props.siteVersion
			? <Version version={ this.props.siteVersion } icon="my-sites" className="plugin-information__version" />
			: null;
	},

	renderLimits() {
		const limits = this.getCompatibilityLimits();
		let versionView = null;
		let versionCheck = null;

		if ( this.props.siteVersion && limits.maxVersion ) {
			if ( versionCompare( this.props.siteVersion, limits.maxVersion, '<=' ) ) {
				versionCheck = <Gridicon icon="checkmark" size={ 18 } />;
			} else {
				versionCheck = <Gridicon icon="cross-small" size={ 18 } />;
			}
		}
		if ( limits.minVersion && limits.maxVersion && limits.minVersion !== limits.maxVersion ) {
			versionView = <div className="plugin-information__version-limit" >
				{ this.translate( '{{wpIcon/}}  Compatible with %(minVersion)s to {{span}} %(maxVersion)s {{versionCheck/}}{{/span}}',
					{
						args: { minVersion: limits.minVersion, maxVersion: limits.maxVersion },
						components: {
							wpIcon: this.props.siteVersion ? null : <Gridicon icon="my-sites" size={ 18 } />,
							span: <span className="plugin-information__version-limit-state" />,
							versionCheck
						}
					}
				) }
			</div>;
		}
		if ( limits.minVersion && limits.maxVersion && limits.minVersion === limits.maxVersion ) {
			versionView = <div className="plugin-information__version-limit">
				{ this.translate( '{{icon/}} Compatible with %(maxVersion)s',
					{
						args: { maxVersion: limits.maxVersion },
						components: { wpIcon: this.props.siteVersion ? null : <Gridicon icon="my-sites" size={ 18 } /> }
					}
				) }
			</div>;
		}
		return (
			<div className="plugin-information__versions">
				{ versionView }
			</div>
		);
	},

	getCompatibilityLimits() {
		if ( this.props.plugin.compatibility && this.props.plugin.compatibility.length ) {
			return {
				maxVersion: this.props.plugin.compatibility[ this.props.plugin.compatibility .length - 1 ],
				minVersion: this.props.plugin.compatibility[ 0 ]
			};
		}
		return {};
	},

	renderPlaceholder() {
		return (
			<div className="plugin-information is-placeholder">
					<div className="plugin-information__wrapper">
						<div className="plugin-information__version-info">
							<div className="plugin-information__version-shell">
								{ this.props.pluginVersion
									? <Version version={ this.props.pluginVersion } icon="plugins" className="plugin-information__version" />
									: null
								}
								{ this.renderLastUpdated() }
							</div>
							<div className="plugin-information__version-shell">
								{ this.renderSiteVersion() }
								{ this.renderLimits() }
							</div>
						</div>
						<div className="plugin-information__links">
							{ this.renderWporgLink() }
							{ this.renderHomepageLink() }
						</div>
					</div>
					<PluginRatings
						rating={ this.props.plugin.rating }
						ratings={ this.props.plugin.ratings }
						downloaded={ this.props.plugin.downloaded }
						numRatings={ this.props.plugin.num_ratings }
						slug={ this.props.plugin.slug }
						placeholder={ true }
					/>
			</div>
		);
	},

	renderWpcom() {
		return (
			<div className="plugin-information">
				<p className="plugin-information__description">
					{ this.props.plugin.description }
				</p>
				<div className="plugin-information__links">
					{ this.renderWPCOMPluginSupportLink() }
				</div>
		</div>
		);
	},

	renderWporg() {
		const classes = classNames( {
			'plugin-information__version-info': true,
			'is-singlesite': !! this.props.siteVersion
		} );
		return (
			<div className="plugin-information">
					<div className="plugin-information__wrapper">
						<div className={ classes }>
							<div className="plugin-information__version-shell">
								<Version version={ this.props.pluginVersion } icon="plugins" className="plugin-information__version" />
								{ this.renderLastUpdated() }
							</div>
							<div className="plugin-information__version-shell plugin-information__site-version-shell">
								{ this.renderSiteVersion() }
								{ this.renderLimits() }
							</div>
						</div>
						<div className="plugin-information__links">
							{ this.renderWporgLink() }
							{ this.renderHomepageLink() }
						</div>
					</div>
					<PluginRatings
						rating={ this.props.plugin.rating }
						ratings={ this.props.plugin.ratings }
						downloaded={ this.props.plugin.downloaded }
						numRatings={ this.props.plugin.num_ratings }
						slug={ this.props.plugin.slug }
					/>
			</div>
		);
	},

	render() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		if ( this.props.plugin.wpcom ) {
			return this.renderWpcom();
		}

		if ( this.props.plugin.wporg ) {
			return this.renderWporg();
		}
		return null;
	}
} );
