import { getPlansSlugs } from './main';

export function isPlan( { product_slug }: { product_slug: string } ): boolean {
	return getPlansSlugs().includes( product_slug );
}
