import { useSelector } from 'react-redux';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';

export function useCheckoutUrl( siteId: number, siteSlug: string ) {
	const isSiteEligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, siteId )
	);
	const plan = isSiteEligibleForProPlan ? 'pro' : 'business';

	return `/checkout/${ siteSlug }/${ plan }`;
}
