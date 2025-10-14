// export interface TitanProductProps {
// 	domain?: string;
// 	meta?: string;
// 	source?: string;
// 	quantity?: number | null;
// 	extra?: RequestCartProductExtra;
// }

import { EmailProvider } from '@automattic/api-core';

// /**
//  * Creates a new shopping cart item for Titan Mail.
//  */
// function titanMailProduct(
// 	properties: TitanProductProps,
// 	productSlug: string
// ): MinimalRequestCartProduct {
// 	const domainName = properties.meta ?? properties.domain;

// 	if ( ! domainName ) {
// 		throw new Error( 'Titan mail requires a domain' );
// 	}

// 	return {
// 		...domainItem( productSlug, domainName, properties.source ),
// 		quantity: properties.quantity,
// 		extra: properties.extra,
// 	};
// }

// /**
//  * Creates a new shopping cart item for Titan Mail Yearly.
//  */
// export function titanMailYearly( properties: TitanProductProps ): MinimalRequestCartProduct {
// 	return titanMailProduct( properties, TITAN_MAIL_YEARLY_SLUG );
// }

// /**
//  * Creates a new shopping cart item for Titan Mail Monthly.
//  */
// export function titanMailMonthly( properties: TitanProductProps ): MinimalRequestCartProduct {
// 	return titanMailProduct( properties, TITAN_MAIL_MONTHLY_SLUG );
// }

const getTitanCartItems = () => {
	// const { emailProduct, newQuantity, quantity } = mailProperties;
	// const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );
	// const cartItemFunction = isTitanMonthlyProduct( emailProduct )
	// 	? titanMailMonthly
	// 	: titanMailYearly;
	// return cartItemFunction( {
	// 	domain: mailboxes[ 0 ].formFields.domain.value,
	// 	quantity,
	// 	extra: {
	// 		email_users,
	// 		new_quantity: newQuantity,
	// 	},
	// } );
};

const getGSuiteCartItems = () => {};

export const getCartItems = ( provider: EmailProvider ) => {
	return provider === 'titan' ? getTitanCartItems() : getGSuiteCartItems();
};
