import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { addQueryArgs } from 'calypso/lib/url';

interface TrialCheckoutUrlArguments {
	productSlug: string;
	siteSlug: string;
	addOn?: MinimalRequestCartProduct;
	fromPlansGrid?: boolean;
}

export function getTrialCheckoutUrl( {
	productSlug,
	siteSlug,
	addOn,
	fromPlansGrid = false,
}: TrialCheckoutUrlArguments ): string {
	const checkoutBasePath = fromPlansGrid
		? `/checkout/from-plans/${ siteSlug }/${ productSlug }`
		: `/checkout/${ siteSlug }/${ productSlug }`;

	const checkoutUrl = addOn
		? `${ checkoutBasePath },${ addOn.product_slug }:-q-${ addOn.quantity }`
		: checkoutBasePath;

	return addQueryArgs(
		{ redirect_to: `/plans/my-plan/trial-upgraded/${ siteSlug }` },
		checkoutUrl
	);
}
