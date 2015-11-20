/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var AnalyticsForm = require( 'my-sites/site-settings/form-analytics' ),
	Card = require( 'components/card' );

module.exports = React.createClass({
	displayName: 'SiteSettingsAnalytics',

	componentWillMount: function() {
		debug( 'Mounting SiteSettingsAnalytics React component.' );
	},

	render: function() {

		return (
			<Card className="analytics-settings">
				<AnalyticsForm site={ this.props.site } />
			</Card>
		);

	}
});
