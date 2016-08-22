var page = require( 'page' ),
	config = require( 'config' ),
	meController = require( 'me/controller' ),
	helpController = require( './controller' );

module.exports = function() {
	page( '/help', meController.sidebar, helpController.help );
	page( '/help/contact', meController.sidebar, helpController.contact );

	if ( config.isEnabled( 'help/courses' ) ) {
		page( '/help/courses', meController.sidebar, helpController.courses );
	}
};
