import { PLAN_HOST_BUNDLE, PLAN_WPCOM_ENTERPRISE } from './constants';
import { getPlansSlugs, isFreePlan } from './main';

type HasSnakeCaseProductSlug = { product_slug: string };
type HasCamelCaseProductSlug = { productSlug: string };
export function isPlan( product: HasSnakeCaseProductSlug | HasCamelCaseProductSlug ): boolean {
	const slug = 'product_slug' in product ? product.product_slug : product.productSlug;
	if ( isFreePlan( slug ) ) {
		return false;
	}
	switch ( slug ) {
		case PLAN_HOST_BUNDLE:
		case PLAN_WPCOM_ENTERPRISE:
			return true;
		default:
			return getPlansSlugs().includes( slug );
	}
}
