/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_KEY } from './domain-suggestions';

const storeKeys = {
	DOMAIN_SUGGESTIONS_KEY,
};

declare const window:
	| undefined
	| ( Window & {
			wpcomFse: Record< string, any >;
	  } );

if ( typeof window === 'object' ) {
	if ( ! window.wpcomFse ) {
		window.wpcomFse = {};
	}
	if ( ! window.wpcomFse.dataStores ) {
		window.wpcomFse.dataStores = {};
	}
	Object.keys( storeKeys ).forEach(
		( key ) => ( window.wpcomFse.dataStores[ key ] = storeKeys[ key as keyof typeof storeKeys ] )
	);
}
