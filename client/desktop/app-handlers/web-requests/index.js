const { session } = require( 'electron' );

const filter = {
	urls: [ 'https://public-api.wordpress.com/pinghub/wpcom/me/newest-note-data' ],
};

module.exports = function () {
	session.defaultSession.webRequest.onBeforeSendHeaders( filter, ( details, callback ) => {
		delete details.requestHeaders.Origin;
		callback( { cancel: false, requestHeaders: details.requestHeaders } );
	} );
};
