/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	WritingForm = require( 'my-sites/site-settings/form-writing' );

module.exports = React.createClass( {
	displayName: 'SiteSettingsWriting',

	componentWillMount: function() {
		debug( 'Mounting SiteSettingsWriting React component.' );
	},

	render: function() {

		return (
			<Card className="writing-settings">
				<WritingForm site={ this.props.site } />
			</Card>
		);

	}
} );
