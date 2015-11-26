/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginIcon = require( 'my-sites/plugins/plugin-icon/plugin-icon' ),
	PluginsStore = require( 'lib/plugins/store' ),
	Rating = require( 'components/rating/' );

module.exports = React.createClass( {

	displayName: 'PluginsBrowserListElement',

	getDefaultProps: function() {
		return {
			iconSize: 40
		};
	},

	getPluginLink: function() {
		var url = '/plugins/' + this.props.plugin.slug;
		if ( this.props.site ) {
			url += '/' + this.props.site;
		}
		return url;
	},

	getSites: function() {
		if ( this.props.site && this.props.currentSites ) {
			return PluginsStore.getSites( this.props.currentSites, this.props.plugin.slug );
		}
		return [];
	},

	renderInstalledIn: function() {
		var sites = this.getSites();
		if ( sites && sites.length > 0 ) {
			return (
				<div className="plugins-browser-item__installed">
						{ this.translate( 'Installed' ) }
				</div>
			);
		}
		return null;
	},

	renderPlaceholder: function() {
		return (
			<li className="plugins-browser-item is-placeholder">
				<span className="plugins-browser-item__link" >
					<div className="plugins-browser-item__info">
						<PluginIcon size={ this.props.iconSize } isPlaceholder={ true } />
						<div className="plugins-browser-item__title">…</div>
						<div className="plugins-browser-item__author">…</div>
					</div>
					<Rating rating={ 0 } />
				</span>
			</li>
		);
	},

	render: function() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}
		return (
			<li className="plugins-browser-item">
				<a href={ this.getPluginLink() } className="plugins-browser-item__link" >
					<div className="plugins-browser-item__info">
						<PluginIcon size={ this.props.iconSize } image={ this.props.plugin.icon } isPlaceholder={ this.props.isPlaceholder } />
						<div className="plugins-browser-item__title">{ this.props.plugin.name }</div>
						<div className="plugins-browser-item__author">{ this.props.plugin.author_name }</div>
						{ this.renderInstalledIn() }
					</div>
					<Rating rating={ this.props.plugin.rating } />
				</a>
			</li>
		);
	}
} );
