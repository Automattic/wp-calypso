import { isGSuiteProductSlug } from '@automattic/calypso-products';
import { TitanProductUser } from '@automattic/shopping-cart';
import {
	googleApps,
	googleAppsExtraLicenses,
	titanMailMonthly,
	titanMailYearly,
} from 'calypso/lib/cart-values/cart-items';
import { GSuiteProductUser } from 'calypso/lib/gsuite/new-users';
import { isTitanMonthlyProduct } from 'calypso/lib/titan';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailProperties } from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-mail-product-properties';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

const getTitanCartItems = (
	mailboxes: MailboxForm< EmailProvider >[],
	mailProperties: MailProperties
) => {
	const { emailProduct, newQuantity, quantity } = mailProperties;

	const email_users = mailboxes.map( ( mailbox ) =>
		mailbox.getAsCartItem()
	) as unknown as TitanProductUser[];

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

const getGSuiteCartItems = (
	mailboxes: MailboxForm< EmailProvider >[],
	mailProperties: MailProperties
) => {
	const { isExtraItemPurchase, emailProduct, newQuantity, quantity } = mailProperties;

	const users = mailboxes.map( ( mailbox ) =>
		mailbox.getAsCartItem()
	) as unknown as GSuiteProductUser[];

	const domain = mailboxes[ 0 ].formFields.domain.value;

	let properties: {
		domain: string;
		new_quantity?: number;
		quantity?: number;
		users: GSuiteProductUser[];
	} = { domain, users };

	const productSlug = emailProduct.product_slug;

	if ( isGSuiteProductSlug( productSlug ) && isExtraItemPurchase ) {
		return googleAppsExtraLicenses( properties );
	}

	properties = { ...properties, quantity };

	if ( isExtraItemPurchase ) {
		properties = { ...properties, new_quantity: newQuantity };
	}

	return googleApps( { ...properties, product_slug: productSlug } );
};

const getCartItems = (
	mailboxes: MailboxForm< EmailProvider >[],
	mailProperties: MailProperties
) => {
	const provider = mailboxes[ 0 ].provider;

	return provider === EmailProvider.Titan
		? getTitanCartItems( mailboxes, mailProperties )
		: getGSuiteCartItems( mailboxes, mailProperties );
};

export default getCartItems;
