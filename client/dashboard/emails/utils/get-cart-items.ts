import { TitanMailSlugs } from '@automattic/api-core';
import { MailboxForm, GSuiteProductUser } from '../entities/mailbox-form';
import { MailboxProvider } from '../types';
import { EmailProperties } from './get-email-product-properties';
import { isMonthlyEmailProduct } from './is-monthly-email-product';
import type { MinimalRequestCartProduct, RequestCartProductExtra } from '@automattic/shopping-cart';

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
	mailboxes: MailboxForm< MailboxProvider >[],
	mailProperties: EmailProperties
) => {
	const { emailProduct, newQuantity, quantity } = mailProperties;
	const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );
	const cartItemFunction = isMonthlyEmailProduct( emailProduct )
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

const getGSuiteCartItems = (
	mailboxes: MailboxForm< MailboxProvider >[],
	mailProperties: EmailProperties
): MinimalRequestCartProduct => {
	const { isAdditionalMailboxesPurchase, emailProduct, newQuantity, quantity } = mailProperties;

	const users = mailboxes.map( ( mailbox ) => < GSuiteProductUser >mailbox.getAsCartItem() );

	const domain = mailboxes[ 0 ].formFields.domain.value;

	return {
		...domainItem( emailProduct.product_slug, domain ),
		...( quantity ? { quantity } : {} ),
		extra: {
			google_apps_users: users,
			...( isAdditionalMailboxesPurchase && newQuantity ? { new_quantity: newQuantity } : {} ),
		},
	};
};

export const getCartItems = (
	mailboxes: MailboxForm< MailboxProvider >[],
	mailProperties: EmailProperties
) => {
	const provider = mailboxes[ 0 ].provider;

	return provider === MailboxProvider.Titan
		? getTitanCartItems( mailboxes, mailProperties )
		: getGSuiteCartItems( mailboxes, mailProperties );
};
