import { formatProduct } from './format-product';
import { isPersonalPlan } from './main';

export function isPersonal( product ) {
	product = formatProduct( product );

	return isPersonalPlan( product.product_slug );
}
