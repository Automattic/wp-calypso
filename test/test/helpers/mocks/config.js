/**
 * Internal Dependencies
 */
const serverConfig = require( '../../../..//server/config' );

export default ( mockery ) => {
	const config = require( 'config' );
	config.load( serverConfig.getClientConfig() );
	mockery.registerMock( 'config', config );
};
