/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function noop( context: PageJS.Context, next: () => void ): void {
	next();
}

export function getDomainOrProductFromContext( { params, store }: PageJS.Context ): string {
	const { domainOrProduct, product } = params;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );

	let result;

	if ( selectedSite?.slug !== domainOrProduct && domainOrProduct ) {
		result = domainOrProduct;
	} else {
		result = product;
	}

	return result || '';
}
