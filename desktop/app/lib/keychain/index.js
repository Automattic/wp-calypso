/*
 * External dependencies
 */
const keytar = require( 'keytar' );

/*
 * Module constants
 */
const keychainService = 'WordPress.com';

async function write( key, value ) {
	return keytar.setPassword( keychainService, key, JSON.stringify( value ) );
}

async function fetch( key ) {
	let value = await keytar.getPassword( keychainService, key );
	if ( value ) {
		value = JSON.parse( value );
	}
	return value;
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
	write,
	fetch,
};
