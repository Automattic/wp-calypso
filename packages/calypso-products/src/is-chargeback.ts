import { PLAN_CHARGEBACK } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isChargeback( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return product.product_slug === PLAN_CHARGEBACK;
	}
	return product.productSlug === PLAN_CHARGEBACK;
}
