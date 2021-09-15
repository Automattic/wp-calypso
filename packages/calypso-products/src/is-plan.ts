import { getPlansSlugs } from './main';

export function isPlan( {
	product_slug,
	productSlug,
}:
	| { productSlug: never; product_slug: string }
	| { product_slug: never; productSlug: string } ): boolean {
	return getPlansSlugs().includes( product_slug ?? productSlug );
}
