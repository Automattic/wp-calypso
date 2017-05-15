var page = require( 'page' ),
	config = require( 'config' ),
	meController = require( 'me/controller' ),
	helpController = require( './controller' );

module.exports = function() {
	if ( config.isEnabled( 'help' ) ) {
		page( '/help', helpController.loggedOut, meController.sidebar, helpController.help );
		page( '/help/contact', helpController.loggedOut, meController.sidebar, helpController.contact );
	}

	if ( config.isEnabled( 'help/courses' ) ) {
		page( '/help/courses', helpController.loggedOut, meController.sidebar, helpController.courses );
	}
};
