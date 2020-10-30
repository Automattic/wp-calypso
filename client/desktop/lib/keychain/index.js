/*
 * External dependencies
 */
const keytar = require( 'keytar' );

/*
 * Module constants
 */
const keychainService = 'WordPress.com';
const credentialsKey = 'User Credentials';

function set( key, value ) {
	return keytar.setPassword( keychainService, key, value );
}

function get( key ) {
	return keytar.getPassword( keychainService, key );
}

async function setUserInfo( info ) {
	return await set( credentialsKey, JSON.stringify( info ) );
}

async function getUserInfo() {
	const info = await get( credentialsKey );
	if ( info ) {
		return JSON.parse( info );
	}
	return null;
}

async function clear() {
	const credentials = await keytar.findCredentials( keychainService );
	if ( credentials && Array.isArray( credentials ) && credentials.length > 0 ) {
		await Promise.all(
			credentials.map( ( { account: key } ) => keytar.deletePassword( keychainService, key ) )
		);
	}
}

module.exports = {
	clear,
	setUserInfo,
	getUserInfo,
};
