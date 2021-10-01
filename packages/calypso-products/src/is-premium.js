import { formatProduct } from './format-product';
import { isPremiumPlan } from './main';

export function isPremium( product ) {
	product = formatProduct( product );

	return isPremiumPlan( product.product_slug );
}
