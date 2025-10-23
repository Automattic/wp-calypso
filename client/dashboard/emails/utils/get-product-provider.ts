import { TitanMailSlugs } from '@automattic/api-core';
import { MailboxProvider } from '../types';

export function getProductProvider( emailProduct: { product_slug: string } ): MailboxProvider {
	if (
		emailProduct.product_slug === TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ||
		emailProduct.product_slug === TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
	) {
		return MailboxProvider.Titan;
	}

	return MailboxProvider.Google;
}
