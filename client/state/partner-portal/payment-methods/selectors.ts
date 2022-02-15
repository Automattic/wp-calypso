import type { State } from 'calypso/state/partner-portal/payment-methods/reducer';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function getCardDataErrors( state: State ): Record< string, string > {
	return state.cardDataErrors;
}

export function getIncompleteFieldKeys( state: State ): string[] {
	return Object.keys( state.cardDataComplete ).filter( ( key ) => ! state.cardDataComplete[ key ] );
}

export function getFields(
	state: State
): Record< string, { value: string; isTouched: boolean; errors: string[] } > {
	return state.fields;
}

export function useAsPrimaryPaymentMethod( state: State ): boolean {
	return state.useAsPrimaryPaymentMethod;
}
