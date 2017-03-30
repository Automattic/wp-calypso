var page = require( 'page' ),
	config = require( 'config' ),
	meController = require( 'me/controller' ),
	helpController = require( './controller' );

module.exports = function() {
	if ( config.isEnabled( 'help' ) ) {
		page(
		    '/help',
			helpController.loggedOut,
			meController.sidebar,
			helpController.help,
			makeLayout,
			clientRender
		);
		page(
		    '/help/contact',
			helpController.loggedOut,
			meController.sidebar,
			helpController.contact,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'help/courses' ) ) {
		page(
		    '/help/courses',
			helpController.loggedOut,
			meController.sidebar,
			helpController.courses,
			makeLayout,
			clientRender
		);
	}
};
