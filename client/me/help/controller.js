/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {
	help: function() {
		var Help = require( './main' );

		titleActions.setTitle( i18n.translate( 'Help', { textOnly: true } ) );

		React.render(
			React.createElement( Help ),
			document.getElementById( 'primary' )
		);
	},

	contact: function() {
		var ContactComponent = require( './help-contact' );

		React.render(
			<ContactComponent />,
			document.getElementById( 'primary' )
		);
	}
};
