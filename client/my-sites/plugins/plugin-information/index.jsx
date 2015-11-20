/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	i18n = require( 'lib/mixins/i18n' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' ),
	Rating = require( 'components/rating' ),
	PluginVersion = require( 'my-sites/plugins/plugin-version' ),
	PluginRatings = require( 'my-sites/plugins/plugin-ratings/' ),
	SectionHeader = require( 'components/section-header' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	_WPORG_PLUGINS_URL: 'wordpress.org/plugins/',

	displayName: 'PluginInformation',

	getDefaultProps: function() {
		return {
			plugin: {
				rating: 0,
			}
		};
	},

	renderHomepageLink: function() {
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

	renderWporgLink: function() {
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

	renderWPCOMPluginSupportLink: function() {
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

	renderStarRating: function() {
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

	renderLastUpdated: function() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			let dateFromNow = i18n.moment.utc( this.props.plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow();
			return <div className="plugin-information__last-updated">{ this.translate( 'Latest release %(dateFromNow)s', { args: { dateFromNow: dateFromNow } } ) }</div>;
		}
	},

	renderLimits: function() {
		var limits = this.getCompatibilityLimits(),
			versionView;

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

	renderRatingsDetail: function() {
		return <PluginRatings plugin={ this.props.plugin } />;
	},

	getCompatibilityLimits: function() {
		if ( this.props.plugin.compatibility && this.props.plugin.compatibility.length ) {
			return {
				maxVersion: this.props.plugin.compatibility[ this.props.plugin.compatibility .length - 1 ],
				minVersion: this.props.plugin.compatibility[ 0 ]
			};
		}
		return {};
	},

	renderPlaceholder: function() {
		return (
			<div className="plugin-information is-placeholder">
				<SectionHeader text={ this.translate( 'Plugin Information' ) } />
				<Card>
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
				</Card>
			</div>
		);
	},

	renderWpcom: function() {
		return (
			<div className="plugin-information">
				<SectionHeader label={ this.translate( 'Plugin Information' ) } />
				<Card>
					<p className="plugin-information__description">
						{ this.props.plugin.description }
					</p>
					{ this.renderWPCOMPluginSupportLink() }
				</Card>
			</div>
		);
	},

	renderWporg: function() {
		return (
			<div className="plugin-information">
				<SectionHeader label={ this.translate( 'Plugin Information' ) } />
				<Card>
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
				</Card>
			</div>
		);
	},

	render: function() {
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
