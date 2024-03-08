import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { addQueryArgs } from 'calypso/lib/url';

interface TrialCheckoutUrlArguments {
	productSlug: string;
	siteSlug: string;
	addOn?: MinimalRequestCartProduct;
}

export function getTrialCheckoutUrl( {
	productSlug,
	siteSlug,
	addOn,
}: TrialCheckoutUrlArguments ): string {
	const checkoutUrl = addOn
		? `/checkout/${ siteSlug }/${ productSlug },${ addOn.product_slug }:-q-${ addOn.quantity }`
		: `/checkout/${ siteSlug }/${ productSlug }`;

	return addQueryArgs(
		{ redirect_to: `/plans/my-plan/trial-upgraded/${ siteSlug }` },
		checkoutUrl
	);
}
