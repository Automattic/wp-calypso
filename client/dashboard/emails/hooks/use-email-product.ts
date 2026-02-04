import { Domain, GoogleWorkspaceSlugs, Product, TitanMailSlugs } from '@automattic/api-core';
import { productsQuery, siteProductsQuery } from '@automattic/api-queries';
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

export const useEmailProduct = (
	provider: MailboxProvider,
	interval: IntervalLength,
	domain?: Domain
) => {
	const siteId = domain?.blog_id;
	const { data: siteProducts } = useQuery( {
		...siteProductsQuery( siteId ?? 0 ),
		enabled: Boolean( siteId ),
	} );
	const { data: products } = useQuery( {
		...productsQuery(),
		enabled: ! siteId,
	} );

	const productSlug = EMAIL_PRODUCTS[ provider ]?.[ interval ];
	const product = ( siteId ? siteProducts : products )?.[ productSlug ] as Product;

	return {
		product,
	};
};
