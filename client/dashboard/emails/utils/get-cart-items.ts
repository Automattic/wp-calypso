import { TitanMailSlugs } from '@automattic/api-core';
import { MinimalRequestCartProduct, RequestCartProductExtra } from '../../shopping-cart/types';
import { MailboxForm } from '../entities/mailbox-form';
import { SupportedEmailProvider } from '../entities/types';
import { EmailProperties } from './get-email-product-properties';
import { isTitanMonthlyProduct } from './is-titan-monthly-product';

export interface TitanProductProps {
	domain?: string;
	meta?: string;
	source?: string;
	quantity?: number | null;
	extra?: RequestCartProductExtra;
}

/**
 * Creates a new shopping cart item for a domain.
 * @param {string} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @param {string|undefined} [source] - optional source for the domain item, e.g. `getdotblog`.
 * @returns {MinimalRequestCartProduct} the new item
 */
export function domainItem(
	productSlug: string,
	domain: string,
	source?: string
): MinimalRequestCartProduct {
	const extra = source ? { extra: { source: source } } : undefined;

	return Object.assign(
		{
			product_slug: productSlug,
			meta: domain,
		},
		extra
	);
}

/**
 * Creates a new shopping cart item for Titan Mail.
 */
function titanMailProduct(
	properties: TitanProductProps,
	productSlug: string
): MinimalRequestCartProduct {
	const domainName = properties.meta ?? properties.domain;

	if ( ! domainName ) {
		throw new Error( 'Titan mail requires a domain' );
	}

	return {
		...domainItem( productSlug, domainName, properties.source ),
		quantity: properties.quantity,
		extra: properties.extra,
	};
}

/**
 * Creates a new shopping cart item for Titan Mail Yearly.
 */
export function titanMailYearly( properties: TitanProductProps ): MinimalRequestCartProduct {
	return titanMailProduct( properties, TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG );
}

/**
 * Creates a new shopping cart item for Titan Mail Monthly.
 */
export function titanMailMonthly( properties: TitanProductProps ): MinimalRequestCartProduct {
	return titanMailProduct( properties, TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG );
}

const getTitanCartItems = (
	mailboxes: MailboxForm< SupportedEmailProvider >[],
	mailProperties: EmailProperties
) => {
	const { emailProduct, newQuantity, quantity } = mailProperties;
	const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );
	const cartItemFunction = isTitanMonthlyProduct( emailProduct )
		? titanMailMonthly
		: titanMailYearly;
	return cartItemFunction( {
		domain: mailboxes[ 0 ].formFields.domain.value,
		quantity,
		extra: {
			email_users,
			new_quantity: newQuantity,
		},
	} );
};

const getGSuiteCartItems = () => {};

export const getCartItems = (
	mailboxes: MailboxForm< SupportedEmailProvider >[],
	mailProperties: EmailProperties
) => {
	const provider = mailboxes[ 0 ].provider;

	return provider === 'titan'
		? getTitanCartItems( mailboxes, mailProperties )
		: getGSuiteCartItems();
};
