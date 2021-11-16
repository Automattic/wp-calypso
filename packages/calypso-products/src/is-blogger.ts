import { isBloggerPlan } from './main';

type WithSnakeCaseSlug = { product_slug: string };
type WithCamelCaseSlug = { productSlug: string };

export function isBlogger( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	if ( 'product_slug' in product ) {
		return isBloggerPlan( product.product_slug );
	}
	return isBloggerPlan( product.productSlug );
}
