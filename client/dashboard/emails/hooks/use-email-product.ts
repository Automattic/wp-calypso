import { Domain, GoogleWorkspaceSlugs, Product } from '@automattic/api-core';
import { productsQuery, siteProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { MailboxProvider, IntervalLength, TitanPlanTier } from '../types';
import { TITAN_TIER_SLUGS } from '../utils/titan-tiers';

const GOOGLE_PRODUCTS = {
	monthly: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	annually: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
};

export const useEmailProduct = (
	provider: MailboxProvider,
	interval: IntervalLength,
	domain?: Domain,
	tier: TitanPlanTier = TitanPlanTier.Pro
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

	const productSlug =
		provider === MailboxProvider.Titan
			? TITAN_TIER_SLUGS[ tier ]?.[ interval ]
			: GOOGLE_PRODUCTS[ interval ];
	const product = ( siteId ? siteProducts : products )?.[ productSlug ] as Product | undefined;

	return {
		product,
	};
};
