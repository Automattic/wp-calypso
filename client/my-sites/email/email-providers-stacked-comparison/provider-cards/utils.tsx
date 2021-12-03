import formatCurrency from '@automattic/format-currency';
import { RequestCartProduct } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import page from 'page';
import React, { FunctionComponent, ReactElement } from 'react';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

export enum TermLength {
	ANNUALLY = 'annually',
	MONTHLY = 'monthly',
}

export const formattedPriceWithTerm = (
	formattedPriceClassName: string,
	termLengthClassName: string,
	cost: number,
	currencyCode: string,
	termLength?: TermLength
) => {
	return translate( '{{price/}} /mailbox {{termLength/}}', {
		components: {
			price: (
				<span className={ formattedPriceClassName }>
					{ formatCurrency( cost ?? 0, currencyCode ) }
				</span>
			),
			termLength: <span className={ termLengthClassName }>/{ termLength }</span>,
		},
		comment:
			'{{price/}} is the formatted price, e.g. $20' +
			'{{termLength/}} is already translated and it is either annually or monthly',
	} );
};

export const AddToCartAndCheckout = (
	shoppingCartManager: any,
	cartItem: RequestCartProduct,
	productList: any,
	setAddingToCart: ( addingToCart: boolean ) => void,
	selectedSite: string
): void => {
	setAddingToCart( true );

	shoppingCartManager
		.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productList ) ] )
		.then( ( response: any ) => {
			setAddingToCart( false );
			const { errors } = response?.messages;
			if ( errors && errors.length ) {
				// Stay on the page to show the relevant error(s)
				return;
			}

			page( `/checkout/${ selectedSite }` );
		} );
};

export const recordTracksEventAddToCartClick = (
	comparisonContext: string,
	validatedMailboxUuids: string[],
	mailboxesAreValid: boolean,
	provider: string,
	source: string,
	userCanAddEmail: boolean,
	userCannotAddEmailReason: any
) => {
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

type PriceWithTermProps = {
	className: string;
	cost: number;
	currencyCode: string;
	hasDiscount: boolean;
	sale?: number | null;
	termLength: TermLength;
};

export const PriceWithTerm: FunctionComponent< PriceWithTermProps > = ( props ) => {
	const { className, cost, currencyCode, hasDiscount, sale, termLength } = props;

	const costClassName = `${ className }__${ hasDiscount ? 'discounted-price' : 'keep-main-price' }`;
	const termLengthClassName = `${ className }__term`;
	const mailboxClassName = `${ className }__mailbox`;
	const saleClassName = `${ className }__sale`;

	const showSale = sale && sale !== 0;

	const lineThrough = {
		textDecoration: hasDiscount || showSale ? 'line-through' : 'solid ',
	};

	const priceSpan = (
		<span style={ lineThrough } className={ costClassName }>
			{ formatCurrency( cost ?? 0, currencyCode ) }
		</span>
	);
	const saleSpan = (
		<span className={ saleClassName }>{ formatCurrency( sale ?? 0, currencyCode ) }</span>
	);
	const termLengthSpan =
		termLength === 'annually' ? (
			<span className={ termLengthClassName }>/{ translate( 'annually' ) }</span>
		) : (
			<span className={ termLengthClassName }>/{ translate( 'monthly' ) }</span>
		);

	const mailboxSpan = <span className={ mailboxClassName }> /{ translate( 'mailbox' ) } </span>;

	return (
		<>
			{ priceSpan } { showSale && saleSpan } { mailboxSpan } { termLengthSpan }
		</>
	);
};

type PriceBadgeProps = {
	additionalPriceInformationComponent?: ReactElement | null;
	className: string;
	priceComponent: ReactElement;
};

export const PriceBadge: FunctionComponent< PriceBadgeProps > = ( props ) => {
	const { additionalPriceInformationComponent, className, priceComponent } = props;
	const priceBadgeClass = `${ className }__price-badge`;
	const additionalPriceInformationClass = `${ className }__provider-additional-price-information`;
	return (
		<div className={ priceBadgeClass }>
			<PromoCardPrice
				formattedPrice={ priceComponent }
				additionalPriceInformation={
					<span className={ additionalPriceInformationClass }>
						{ additionalPriceInformationComponent }
					</span>
				}
			/>
		</div>
	);
};
