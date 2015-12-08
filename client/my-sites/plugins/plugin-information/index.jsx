/**
 * External dependencies
 */
import React from 'react/addons';
import i18n from 'lib/mixins/i18n';

/**
 * Internal dependencies
 */

import Gridicon from 'components/gridicon';
import Rating from 'components/rating';
import PluginVersion from 'my-sites/plugins/plugin-version';
import PluginRatings from 'my-sites/plugins/plugin-ratings/';
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
			<div>
				<a
					className="plugin-information__external-link"
					target="_blank"
					onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked Plugin Homepage Link', 'Plugin Name', this.props.plugin.slug ) }
					href={ this.props.plugin.plugin_url }
				>
					<Gridicon size={ 12 } icon="external" />{ this.translate( 'Plugin homepage' ) }
				</a>
			</div>
		);
	},

	renderWporgLink() {
		if ( ! this.props.plugin.slug ) {
			return;
		}
		return (
			<div>
				<a
					className="plugin-information__external-link"
					target="_blank"
					onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked wp.org Plugin Link', 'Plugin Name', this.props.plugin.slug ) }
					href={ 'https://' + this._WPORG_PLUGINS_URL + this.props.plugin.slug + '/' }
				>
					<Gridicon size={ 12 } icon="external" />{ this.translate( 'WordPress.org Plugin page' ) }
				</a>
			</div>
		);
	},

	renderWPCOMPluginSupportLink() {
		if ( ! this.props.plugin || ! this.props.plugin.support_URL ) {
			return;
		}

		return (
			<a
				className="plugin-information__external-link"
				target="_blank"
				onClick={ analytics.ga.recordEvent.bind( analytics, 'Plugins', 'Clicked Plugin Homepage Link', 'Plugin Name', this.props.plugin.slug ) }
				href={ this.props.plugin.support_URL }
			>
				<Gridicon size={ 12 } icon="external" />{ this.translate( 'Learn More' ) }
			</a>
		);
	},

	renderStarRating() {
		return (
			<div>
				<div className="plugin-information__rating-stars"><Rating rating={ this.props.plugin.rating } /></div>
				<div className="plugin-information__rating-text">
					{ this.translate( 'Based on %(ratingsNumber)s rating', 'Based on %(ratingsNumber)s ratings', {
						count: this.props.plugin.num_ratings,
						args: { ratingsNumber: this.props.plugin.num_ratings }
					} ) }
				</div>
			</div>
		);
	},

	renderLastUpdated() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			let dateFromNow = i18n.moment.utc( this.props.plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow();
			return <div className="plugin-information__last-updated">{ this.translate( 'Latest release %(dateFromNow)s', { args: { dateFromNow: dateFromNow } } ) }</div>;
		}
	},

	renderLimits() {
		const limits = this.getCompatibilityLimits();
		let versionView;

		if ( limits.minVersion && limits.maxVersion && limits.minVersion !== limits.maxVersion ) {
			versionView = <div className="plugin-information__version-limit">
				{ this.translate( 'Compatible with WordPress version %(minVersion)s to %(maxVersion)s',
					{ args: { minVersion: limits.minVersion, maxVersion: limits.maxVersion } }
				) }
			</div>;
		}
		if ( limits.minVersion && limits.maxVersion && limits.minVersion === limits.maxVersion ) {
			versionView = <div className="plugin-information__version-limit">
				{ this.translate( 'Compatible with WordPress version %(maxVersion)s', { args: { maxVersion: limits.maxVersion } } ) }
			</div>;
		}
		return (
			<div className="plugin-information__versions">
				{ versionView }
			</div>
		);
	},

	renderRatingsDetail() {
		return <PluginRatings plugin={ this.props.plugin } />;
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
							{ this.renderLastUpdated() }
							<PluginVersion plugin={ this.props.plugin } />
							{ this.renderLimits() }
						</div>
						<div className="plugin-information__rating-info">
							{ this.renderStarRating() }
							{ this.renderRatingsDetail() }
						</div>
						<div className="plugin-information__links">
							{ this.renderWporgLink() }
							{ this.renderHomepageLink() }
						</div>
					</div>
			</div>
		);
	},

	renderWpcom() {
		return (
			<div className="plugin-information">
					<p className="plugin-information__description">
						{ this.props.plugin.description }
					</p>
					{ this.renderWPCOMPluginSupportLink() }
			</div>
		);
	},

	renderWporg() {
		return (
			<div className="plugin-information">
					<div className="plugin-information__wrapper">
						<div className="plugin-information__version-info">
							{ this.renderLastUpdated() }
							<PluginVersion plugin={ this.props.plugin } />
							{ this.renderLimits() }
						</div>
						<div className="plugin-information__rating-info">
							{ this.renderStarRating() }
							{ this.renderRatingsDetail() }
						</div>
						<div className="plugin-information__links">
							{ this.renderWporgLink() }
							{ this.renderHomepageLink() }
						</div>
					</div>
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
