import { type BillingTerm, getTermFromDuration } from '@automattic/calypso-products';
import usePlans from '../queries/use-plans';
import useCurrentPlan from './use-current-plan';

interface Props {
	siteId?: string | number | null;
}

const useCurrentPlanTerm = ( { siteId }: Props ): BillingTerm[ 'term' ] | undefined => {
	const plans = usePlans( { coupon: undefined } ).data;
	const currentPlan = useCurrentPlan( { siteId } );

	return plans && currentPlan
		? getTermFromDuration( plans[ currentPlan.planSlug ]?.pricing?.billPeriod )
		: undefined;
};

export default useCurrentPlanTerm;
