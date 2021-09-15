import { getPlansSlugs } from './main';

export function isPlan( { product_slug } ) {
	return getPlansSlugs().includes( product_slug );
}
