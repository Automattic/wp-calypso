var page = require( 'page' ),
	meController = require( 'me/controller' ),
	helpController = require( './controller' );

module.exports = function() {
	page( '/help', meController.sidebar, helpController.help );
	page( '/help/contact', meController.sidebar, helpController.contact );
};
