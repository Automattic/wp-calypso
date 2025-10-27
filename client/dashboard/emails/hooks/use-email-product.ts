import { GoogleWorkspaceSlugs, Product, TitanMailSlugs } from '@automattic/api-core';
import { productsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { MailboxProvider, IntervalLength } from '../types';

const EMAIL_PRODUCTS = {
	[ MailboxProvider.Titan ]: {
		monthly: TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
		annually: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
	},
	[ MailboxProvider.Google ]: {
		monthly: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
		annually: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	},
};

export const useEmailProduct = ( provider: MailboxProvider, interval: IntervalLength ) => {
	const { data: products } = useQuery( productsQuery() );

	const productSlug = EMAIL_PRODUCTS[ provider ][ interval ];
	const product = products?.[ productSlug ] as Product;

	return {
		product,
	};
};
