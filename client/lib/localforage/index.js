/**
 * External dependencies
 */
import localforage from 'localforage';
import reduce from 'lodash/reduce';

const config = {
	name: 'calypso',
	storeName: 'calypso_store',
	version: 1.0,
	description: 'Calypso Browser Storage',
	driver: [
		localforage.INDEXEDDB,
		localforage.WEBSQL,
		localforage.LOCALSTORAGE
	]
};

// Promise that resolves when our localforage configuration has been applied
const localForagePromise = new Promise( ( resolve ) => {
	localforage.config( config );
	resolve( localforage );
} );

// Wraps a function to run after waiting until a promise has resolved.
// The promise should contain the original object for context.
const wrapOriginalFunc = ( promise, original ) => {
	return function( ...args ) {
		return promise.then( ( context ) => original.apply( context, args ) );
	};
}

// List of localforage methods that should wait for localForagePromise to resolve
const wrapFuncs = [
	'getItem', 'setItem', 'removeItem',
	'length', 'key', 'keys', 'iterate', 'clear'
];

// Proxy each localforage method to ensure our configuration is initialized first
// NOTE: This means every localForage method returns a promise
const localForageProxy = reduce(
		wrapFuncs,
		( result, fn ) => {
			result[ fn ] = wrapOriginalFunc( localForagePromise, localforage[ fn ] );
			return result;
		},
		{}
);

export default Object.assign( {}, localforage, localForageProxy );
