import { MailboxForm, GSuiteProductUser } from '../entities/mailbox-form';
import { MailboxProvider } from '../types';
import { EmailProperties } from './get-email-product-properties';
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
 * Returns the number of mailboxes being bought. On a first purchase WordPress.com
 * provisions exactly this many mailboxes, so it is never lower than 1.
 */
function getTitanNewMailboxCount( extra?: RequestCartProductExtra ): number {
	const newQuantity = extra?.new_quantity ?? 0;
	if ( newQuantity >= 1 ) {
		return newQuantity;
	}

	const mailboxCount = extra?.email_users?.length ?? 0;
	if ( mailboxCount >= 1 ) {
		return mailboxCount;
	}

	return 1;
}

/**
 * Creates a new shopping cart item for Titan Mail.
 */
export function titanMailProduct(
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
		extra: {
			...properties.extra,
			new_quantity: getTitanNewMailboxCount( properties.extra ),
		},
	};
}

const getTitanCartItems = (
	mailboxes: MailboxForm< MailboxProvider >[],
	mailProperties: EmailProperties
) => {
	const { emailProduct, newQuantity, quantity } = mailProperties;
	const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );
	return titanMailProduct(
		{
			domain: mailboxes[ 0 ].formFields.domain.value,
			quantity,
			extra: {
				email_users,
				new_quantity: newQuantity,
			},
		},
		emailProduct.product_slug
	);
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
