/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

export function getCheckoutRedirectProduct( state: AppState ): string | null {
	return state.ui.checkout.redirectProduct;
}
