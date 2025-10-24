import { Domain, EmailSubscription, Product } from '@automattic/api-core';
import { MailboxProvider } from '../types';
import { getProductProvider } from './get-product-provider';

export const getEmailSubscription = ( {
	domain,
	product,
}: {
	domain: Domain;
	product: Product;
} ) => {
	const provider = getProductProvider( product );
	if ( provider === MailboxProvider.Titan && domain.titan_mail_subscription ) {
		return domain.titan_mail_subscription as EmailSubscription;
	} else if ( provider === MailboxProvider.Google && domain.google_apps_subscription ) {
		return domain.google_apps_subscription as EmailSubscription;
	}
	return undefined;
};
