const { app, session } = require( 'electron' );

const filter = {
	urls: [ 'wss://public-api.wordpress.com/pinghub/wpcom/me/newest-note-data*' ],
};

module.exports = function () {
	app.on( 'ready', () => {
		session.defaultSession.webRequest.onBeforeSendHeaders( filter, ( details, callback ) => {
			delete details.requestHeaders.Origin;
			callback( { cancel: false, requestHeaders: details.requestHeaders } );
		} );
	} );
};
