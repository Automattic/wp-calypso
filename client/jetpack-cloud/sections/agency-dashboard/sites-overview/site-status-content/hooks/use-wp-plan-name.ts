import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { getPlan } from '@automattic/calypso-products/src';

const PLANS = [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_PREMIUM, PLAN_PERSONAL ];

const useWPPlanName = ( plans: Array< string > ) => {
	const getPlanName = () => {
		for ( const plan of plans ) {
			const matchingPlan = PLANS.find( ( planConstant ) => plan.startsWith( planConstant ) );
			if ( matchingPlan ) {
				return getPlan( matchingPlan )?.getTitle();
			}
		}
		return '';
	};

	return getPlanName();
};

export default useWPPlanName;
