import formatCurrency from '@automattic/format-currency';
import {
	RequestCartProduct,
	ResponseCart,
	ShoppingCartManagerActions,
} from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import page from 'page';
import React, { FunctionComponent } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { IncompleteRequestCartProduct } from 'calypso/lib/cart-values/cart-items';

export enum IntervalLength {
	ANNUALLY = 'annually',
	MONTHLY = 'monthly',
}

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

type PriceWithIntervalProps = {
	className: string;
	cost: number;
	currencyCode: string;
	hasDiscount: boolean;
	intervalLength: IntervalLength;
	sale?: number | null;
};

export const PriceWithInterval: FunctionComponent< PriceWithIntervalProps > = ( props ) => {
	const { className, cost, currencyCode, hasDiscount, sale, intervalLength } = props;

	const priceClassName = `${ className }__${
		hasDiscount ? 'discounted-price' : 'keep-main-price'
	}`;
	const intervalLengthClassName = `${ className }__interval`;
	const mailboxClassName = `${ className }__mailbox`;
	const saleClassName = `${ className }__sale`;

	const showSale = sale && sale !== 0;

	const lineThrough = {
		textDecoration: hasDiscount || showSale ? 'line-through' : 'solid ',
	};

	const priceSpan = (
		<span style={ lineThrough } className={ priceClassName }>
			{ formatCurrency( cost ?? 0, currencyCode ) }
		</span>
	);

	const saleSpan = showSale && (
		<span className={ saleClassName }>{ formatCurrency( sale ?? 0, currencyCode ) }</span>
	);

	const intervalLengthSpan = (
		<span className={ intervalLengthClassName }>
			{ intervalLength === IntervalLength.ANNUALLY ? translate( '/year' ) : translate( '/month' ) }
		</span>
	);

	const mailboxSpan = <span className={ mailboxClassName }>{ translate( '/mailbox' ) } </span>;

	return (
		<>
			{ priceSpan } { saleSpan } { mailboxSpan } { intervalLengthSpan }
		</>
	);
};
