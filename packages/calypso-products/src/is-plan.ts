import { PLAN_HOST_BUNDLE, PLAN_FREE } from './constants';
import { getPlansSlugs } from './main';

type SnakeCaseProduct = { product_slug: string };
type CamelCaseProduct = { productSlug: string };
export function isPlan( product: SnakeCaseProduct | CamelCaseProduct ): boolean {
	const slug = 'product_slug' in product ? product.product_slug : product.productSlug;
	if ( slug === PLAN_FREE ) {
		return false;
	}
	return getPlansSlugs().includes( slug ) || slug === PLAN_HOST_BUNDLE;
}
