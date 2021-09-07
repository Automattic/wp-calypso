import type { State } from 'calypso/state/partner-portal/payment-methods/reducer';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getBrand( state: State ): string {
	return state.brand || '';
}

export function getCardDataErrors( state: State ): Record< string, unknown > {
	return state.cardDataErrors;
}

export function getIncompleteFieldKeys( state: State ): string[] {
	return Object.keys( state.cardDataComplete ).filter( ( key ) => ! state.cardDataComplete[ key ] );
}

export function getFields( state: State ): Record< string, string > {
	return state.fields;
}
