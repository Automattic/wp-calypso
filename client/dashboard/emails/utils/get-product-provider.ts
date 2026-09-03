import { TitanMailSlugs } from '@automattic/api-core';
import { MailboxProvider } from '../types';

export function getProductProvider( emailProduct: { product_slug: string } ): MailboxProvider {
	const titanSlugs = Object.values( TitanMailSlugs ) as readonly string[];

	if ( titanSlugs.includes( emailProduct.product_slug ) ) {
		return MailboxProvider.Titan;
	}

	return MailboxProvider.Google;
}
