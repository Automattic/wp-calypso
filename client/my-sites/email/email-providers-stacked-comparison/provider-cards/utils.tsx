import formatCurrency from '@automattic/format-currency';
import {
	RequestCartProduct,
	ResponseCart,
	ShoppingCartManagerActions,
} from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import page from 'page';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { IncompleteRequestCartProduct } from 'calypso/lib/cart-values/cart-items';

export enum IntervalLength {
	ANNUALLY = 'annually',
	MONTHLY = 'monthly',
}

export const formattedPriceWithInterval = (
	formattedPriceClassName: string,
	intervalLengthClassName: string,
	cost: number,
	currencyCode: string,
	intervalLength?: IntervalLength
) => {
	return translate( '{{price/}} /mailbox {{intervalLength/}}', {
		components: {
			price: (
				<span className={ formattedPriceClassName }>
					{ formatCurrency( cost ?? 0, currencyCode ) }
				</span>
			),
			intervalLength: <span className={ intervalLengthClassName }>/{ intervalLength }</span>,
		},
		comment:
			'{{price/}} is the formatted price, e.g. $20' +
			'{{intervalLength/}} is already translated and it is either annually or monthly',
	} );
};

export const addToCartAndCheckout = (
	shoppingCartManager: ShoppingCartManagerActions,
	cartItem: RequestCartProduct | IncompleteRequestCartProduct,
	productList: Record< string, { product_id: number } >,
	setAddingToCart: ( addingToCart: boolean ) => void,
	selectedSite: string
): void => {
	setAddingToCart( true );

	shoppingCartManager
		.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productList ) ] )
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
	userCannotAddEmailReason?: { code: string } | null
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
