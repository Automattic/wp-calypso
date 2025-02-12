const path = require( 'node:path' );
const { app } = require( 'electron' );
const Config = require( '../../lib/config' );

module.exports = function () {
	const protocol = Config.protocol;
	if ( process.defaultApp ) {
		if ( process.argv.length >= 2 ) {
			app.setAsDefaultProtocolClient( protocol, process.execPath, [
				path.resolve( process.argv[ 1 ] ),
			] );
		}
	} else {
		app.setAsDefaultProtocolClient( protocol );
	}
};
