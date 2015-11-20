/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	Site = require( 'my-sites/site' ),
	PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' );

module.exports = React.createClass( {

	displayName: 'PluginSiteBusiness',

	propTypes: {
		site: React.PropTypes.object,
		notices: React.PropTypes.object,
	},

	render: function() {
		if ( ! ( this.props.site && this.props.site.plugin ) && this.props.jetpack ) {
			return null;
		}

		return (
			<CompactCard className="plugin-site plugin-site-business">
				<Site site={ this.props.site } indicator={ false } />
				<span className="plugin-site__embed-action plugin-site-business__embed-action">
					<PluginActivateToggle site={ this.props.site } plugin={ this.props.site.plugin } notices={ this.props.notices } />
				</span>
			</CompactCard>
		);
	}
} );
