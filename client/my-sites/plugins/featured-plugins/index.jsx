/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {

	displayName: 'FeaturedPlugins',

	getSingleView: function( plugin ) {
		var featuredPluginStyles = {};

		if ( plugin.banners ) {
			featuredPluginStyles = {
				backgroundImage: 'url(\'' + plugin.banners.low + '\' )',
				backgroundSize: '100% 100%'
			};
		}

		return (
			<div key={ "featured_" + plugin.slug } className="featured-plugins__element" style={ featuredPluginStyles }>
				<a className="featured-plugins__link" href={ plugin.link }>
					{ plugin.name }
				</a>
			</div>
		);
	},

	getFeaturedPluginViews: function() {
		var featuredPluginViews = this.props.plugins.map( function( plugin ) {
			return this.getSingleView( plugin );
		}, this );

		return featuredPluginViews;
	},

	render: function() {
		return (
			<div className="featured-plugins">
				{ this.getFeaturedPluginViews() }
			</div>
		);
	}
} );
