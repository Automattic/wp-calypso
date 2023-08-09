const { safeStorage } = require( 'electron' );
const ElectronStore = require( 'electron-store' );

const keychainService = 'WordPress.com';
const encoding = 'utf8';

const store = new ElectronStore( {
	name: keychainService,
	watch: true,
} );

async function write( key, value ) {
	if ( ! safeStorage.isEncryptionAvailable() ) {
		throw new Error( 'Encryption is not avaialble.' );
	}

	const buffer = safeStorage.encryptString( value );
	store.set( key, buffer.toString( encoding ) );
}

async function read( key ) {
	if ( store.has( key ) ) {
		const buffer = store.get( key );
		return safeStorage.decryptString( Buffer.from( buffer, encoding ) );
	}
	throw new Error( 'Requested value not found.' );
}

async function clear() {
	store.clear();
}

module.exports = {
	clear,
	write,
	read,
};
