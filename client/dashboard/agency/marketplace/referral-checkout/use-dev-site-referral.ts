import { agencyDevSiteLicenseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { ShoppingCartItem } from '../products/use-shopping-cart';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

export interface DevSiteReferral {
	licenseId: number;
	/** The product the license is for, which the referral names as is. */
	productId: number;
	siteUrl: string;
}

/**
 * The cart for referring one of the agency's development sites: the plan its
 * development license is for, as a single line, and the license the client
 * takes over with it. `blogId` comes from the `referral_blog_id` search param.
 * The term is the one the license's product is billed on, whatever the
 * agency's saved term says.
 */
export function useDevSiteReferral(
	agencyId: number,
	blogId: number | undefined,
	products: AgencyProduct[]
): {
	items: ShoppingCartItem[];
	license?: DevSiteReferral;
	term?: TermPricing;
	isLoading: boolean;
	/** The license could not be loaded, or its plan is not in the catalogue. */
	isMissing: boolean;
} {
	const { data: license, isLoading } = useQuery(
		agencyDevSiteLicenseQuery( agencyId, blogId ?? 0 )
	);
	const product =
		license &&
		products.find( ( candidate ) =>
			[ candidate.product_id, candidate.monthly_product_id, candidate.yearly_product_id ].includes(
				license.product_id
			)
		);

	if ( ! product || ! license ) {
		return { items: [], isLoading, isMissing: !! blogId && ! isLoading };
	}

	return {
		items: [ { slug: product.slug, quantity: 1 } ],
		license: {
			licenseId: license.license_id,
			productId: license.product_id,
			siteUrl: license.site_url,
		},
		term: license.product_id === product.yearly_product_id ? 'yearly' : 'monthly',
		isLoading,
		isMissing: false,
	};
}
