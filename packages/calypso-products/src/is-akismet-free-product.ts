import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_AKISMET_FREE, PRODUCT_AKISMET_ENTERPRISE_YEARLY } from './constants/akismet';
import type { WithSlugAndAmount } from './types';

// AKISMET_ENTERPRISE_YEARLY has a $0 plan for nonprofits, so we need to check the amount
// to determine if it's free or not.
export function isAkismetFreeProduct( product: WithSlugAndAmount ): boolean {
	return (
		PRODUCT_AKISMET_FREE === camelOrSnakeSlug( product ) ||
		( PRODUCT_AKISMET_ENTERPRISE_YEARLY === camelOrSnakeSlug( product ) && product.amount === 0 )
	);
}
