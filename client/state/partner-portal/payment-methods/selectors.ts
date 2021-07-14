/**
 * Internal dependencies
 */

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getBrand( state ) {
	return state.brand || '';
}

export function getCardDataErrors( state ) {
	return state.cardDataErrors;
}

export function getIncompleteFieldKeys( state ) {
	return Object.keys( state.cardDataComplete ).filter( ( key ) => ! state.cardDataComplete[ key ] );
}

export function getFields( state ) {
	return state.fields;
}
