import { addQueryArgs } from 'calypso/lib/url';

interface MigrationTrialCheckoutUrlArguments {
	productSlug: string;
	siteSlug: string;
}

export function getMigrationTrialCheckoutUrl( {
	productSlug,
	siteSlug,
}: MigrationTrialCheckoutUrlArguments ): string {
	return addQueryArgs(
		{ redirect_to: `/plans/my-plan/trial-upgraded/${ siteSlug }` },
		`/checkout/${ siteSlug }/${ productSlug }`
	);
}
