const electron = require( 'electron' );
const electronStore = require( 'electron-store' );

const keychainService = 'WordPress.com';
const store = new electronStore.Store( {
	name: keychainService,
	watch: true,
} );

async function write( key, value ) {
	if ( ! electron.safeStorage.isEncryptionAvailable() ) {
		return;
	}
	const buffer = electron.safeStorage.encryptString( value );
	store.set( key, buffer.toString( 'latin1' ) );
}

async function read( key ) {
	if ( store.has( key ) ) {
		const buffer = store.get( key );
		return electron.safeStorage.decryptString( Buffer.from( buffer, 'latin1' ) );
	}
	return null;
}

async function clear() {
	store.clear();
}

module.exports = {
	clear,
	write,
	read,
};
