import page from '@automattic/calypso-router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type {
	RequestCartProduct,
	ResponseCart,
	ShoppingCartManagerActions,
	MinimalRequestCartProduct,
} from '@automattic/shopping-cart';
import type { CannotAddEmailReason } from 'calypso/lib/domains/types';

export const addToCartAndCheckout = (
	shoppingCartManager: ShoppingCartManagerActions,
	cartItem: RequestCartProduct | MinimalRequestCartProduct,
	setAddingToCart: ( addingToCart: boolean ) => void,
	selectedSite: string
): void => {
	setAddingToCart( true );

	shoppingCartManager
		.addProductsToCart( [ cartItem ] )
		.then( ( response: ResponseCart ) => {
			setAddingToCart( false );

			const errors = response?.messages?.errors;

			if ( errors && errors.length ) {
				// Stay on the page to show the relevant error(s)
				return;
			}

			page( `/checkout/${ selectedSite }` );
		} )
		.catch( () => {
			setAddingToCart( false );
		} );
};

export const recordTracksEventAddToCartClick = (
	comparisonContext: string,
	validatedMailboxUuids: string[],
	mailboxesAreValid: boolean,
	provider: string,
	source: string,
	userCanAddEmail: boolean,
	userCannotAddEmailReason?: CannotAddEmailReason | null
): void => {
	recordTracksEvent( 'calypso_email_providers_add_click', {
		context: comparisonContext,
		mailbox_count: validatedMailboxUuids.length,
		mailboxes_valid: mailboxesAreValid ? 1 : 0,
		provider: provider,
		source,
		user_can_add_email: userCanAddEmail,
		user_cannot_add_email_code: userCannotAddEmailReason ? userCannotAddEmailReason.code : '',
	} );
};
