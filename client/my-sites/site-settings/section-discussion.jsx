/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var DiscussionForm = require( 'my-sites/site-settings/form-discussion' );

module.exports = React.createClass( {
	displayName: 'SiteSettingsDiscussion',

	componentWillMount: function() {
		debug( 'Mounting SiteSettingsDiscussion React component.' );
	},

	render: function() {
		return (
			<DiscussionForm site={ this.props.site } />
		);
	}
} );
