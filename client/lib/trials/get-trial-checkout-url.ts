import { addQueryArgs } from 'calypso/lib/url';

interface TrialCheckoutUrlArguments {
	productSlug: string;
	siteSlug: string;
}

export function getTrialCheckoutUrl( {
	productSlug,
	siteSlug,
}: TrialCheckoutUrlArguments ): string {
	return addQueryArgs(
		{ redirect_to: `/plans/my-plan/trial-upgraded/${ siteSlug }` },
		`/checkout/${ siteSlug }/${ productSlug }`
	);
}
