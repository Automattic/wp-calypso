import { addQueryArgs } from 'calypso/lib/url';

interface ECommerceTrialCheckoutUrlArguments {
	productSlug: string;
	siteSlug: string;
}

export function getECommerceTrialCheckoutUrl( {
	productSlug,
	siteSlug,
}: ECommerceTrialCheckoutUrlArguments ): string {
	return addQueryArgs(
		{ redirect_to: `/plans/my-plan/trial-upgraded/${ siteSlug }` },
		`/checkout/${ siteSlug }/${ productSlug }`
	);
}
