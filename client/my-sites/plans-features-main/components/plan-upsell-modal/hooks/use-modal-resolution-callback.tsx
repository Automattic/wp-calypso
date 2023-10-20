import { isFreePlan, isMonthly } from '@automattic/calypso-products';
import { useCallback } from '@wordpress/element';
import { DataResponse } from 'calypso/my-sites/plans-grid/types';
import {
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	MONTHLY_PLAN_DONT_MISS_OUT_DIALOG,
	MONTHLY_PLAN_SAVE_UPTO_DIALOG,
	ModalType,
	PAID_PLAN_IS_REQUIRED_DIALOG,
} from '..';
import { YearlyPlanUpsellModalVariations } from './use-yearly-plan-upsell-modal-experiment';
type Props = {
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >;
	isPlanUpsellEnabledOnFreeDomain: DataResponse< boolean >;
	yearlyPlanUpsellModalDisplayDecider: DataResponse< YearlyPlanUpsellModalVariations >;
	flowName?: string | null;
	paidDomainName?: string | null;
};

/**
 * Provides a callback that resolves a ModalType based on a set of predefined parameters
 */
export function useModalResolutionCallback( {
	isCustomDomainAllowedOnFreePlan,
	isPlanUpsellEnabledOnFreeDomain,
	yearlyPlanUpsellModalDisplayDecider,
	flowName,
	paidDomainName,
}: Props ) {
	return useCallback(
		function ( currentSelectedPlan?: string | null ): ModalType | null {
			if ( currentSelectedPlan && isFreePlan( currentSelectedPlan ) ) {
				if ( isFreePlan( currentSelectedPlan ) ) {
					if ( isPlanUpsellEnabledOnFreeDomain.result ) {
						return FREE_PLAN_FREE_DOMAIN_DIALOG;
					}

					if ( isCustomDomainAllowedOnFreePlan.result ) {
						return FREE_PLAN_PAID_DOMAIN_DIALOG;
					}

					if ( paidDomainName && ( flowName === 'onboarding' || flowName === 'onboarding-pm' ) ) {
						return PAID_PLAN_IS_REQUIRED_DIALOG;
					}
				} else if ( isMonthly( currentSelectedPlan ) ) {
					switch ( yearlyPlanUpsellModalDisplayDecider.result ) {
						case 'save_money':
							return MONTHLY_PLAN_SAVE_UPTO_DIALOG;
						case 'dont_miss_out':
							return MONTHLY_PLAN_DONT_MISS_OUT_DIALOG;
						case 'control':
						default:
							return null;
					}
				}
			}
			return null;
		},
		[
			flowName,
			isCustomDomainAllowedOnFreePlan.result,
			isPlanUpsellEnabledOnFreeDomain.result,
			paidDomainName,
			yearlyPlanUpsellModalDisplayDecider.result,
		]
	);
}
