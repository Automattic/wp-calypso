import { AppState } from 'calypso/types';

/**
 * Gets the loading state of the cart.
 * This selector is used on the themes page to lock
 * the button while adding products to the cart.
 * @param state
 * @returns boolean
 */
export function getIsLoadingCart( state: AppState ): boolean {
	return state?.themes?.isLoadingCart;
}
