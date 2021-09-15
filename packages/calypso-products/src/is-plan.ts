import { PLAN_HOST_BUNDLE, PLAN_FREE } from './constants';
import { getPlansSlugs } from './main';

export function isPlan( {
	product_slug,
	productSlug,
}:
	| { productSlug: never; product_slug: string }
	| { product_slug: never; productSlug: string } ): boolean {
	const slug = product_slug ?? productSlug;
	if ( slug === PLAN_FREE ) {
		return false;
	}
	return getPlansSlugs().includes( slug ) || slug === PLAN_HOST_BUNDLE;
}
