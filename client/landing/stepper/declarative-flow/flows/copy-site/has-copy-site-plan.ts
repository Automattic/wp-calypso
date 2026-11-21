import { COPY_SITE_FLOW } from '@automattic/onboarding';
import type { ResponseCart } from '@automattic/shopping-cart';

export function hasCopySitePlan( cart: ResponseCart | undefined, planSlug: string | undefined ) {
	return (
		!! planSlug &&
		!! cart?.products.some(
			( { product_slug, extra } ) =>
				product_slug === planSlug &&
				!! extra &&
				'signup_flow' in extra &&
				extra.signup_flow === COPY_SITE_FLOW
		)
	);
}
