import { isFreePlan } from '@automattic/calypso-products';
import { useCallback } from '@wordpress/element';
import {
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	ModalType,
	PAID_PLAN_IS_REQUIRED_DIALOG,
} from '..';
type Props = {
	isCustomDomainAllowedOnFreePlan?: boolean | null;
	flowName?: string | null;
	paidDomainName?: string | null;
	intent?: string | null;
};

/**
 * Provides a callback that resolves a ModalType based on a set of predefined parameters
 */
export function useModalResolutionCallback( {
	isCustomDomainAllowedOnFreePlan,
	flowName,
	paidDomainName,
	intent,
}: Props ) {
	return useCallback(
		( currentSelectedPlan?: string | null ): ModalType | null => {
			if ( currentSelectedPlan && isFreePlan( currentSelectedPlan ) ) {
				if ( isCustomDomainAllowedOnFreePlan ) {
					if ( paidDomainName ) {
						return FREE_PLAN_PAID_DOMAIN_DIALOG;
					}
					return FREE_PLAN_FREE_DOMAIN_DIALOG;
				}

				// TODO: look into decoupling the flowName from here as well.
				if (
					paidDomainName &&
					( flowName === 'onboarding' || intent === 'plans-jetpack-app-site-creation' )
				) {
					return PAID_PLAN_IS_REQUIRED_DIALOG;
				}
			}
			return null;
		},
		[ isCustomDomainAllowedOnFreePlan, flowName, paidDomainName, intent ]
	);
}
