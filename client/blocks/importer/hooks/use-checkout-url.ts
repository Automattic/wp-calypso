import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { useSelector } from 'calypso/state';

export function useCheckoutUrl(
	siteId: number | undefined | null,
	siteSlug: string | undefined | null
): string {
	const isSiteEligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, siteId )
	);
	const plan = isSiteEligibleForProPlan ? 'pro' : 'business';
	if ( ! siteSlug ) {
		return `/checkout/${ plan }`;
	}
	return `/checkout/${ siteSlug }/${ plan }`;
}
