import { isFreePlan } from '@automattic/calypso-products';
import { useCallback } from 'react';
import useIsCustomDomainAllowedOnFreePlan from 'calypso/my-sites/plans-features-main/hooks/use-is-custom-domain-allowed-on-free-plan';
import {
	MODAL_LOADER,
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	PAID_PLAN_IS_REQUIRED_DIALOG,
} from '..';
type Props = {
	paidDomainName?: string | null;
	flowName?: string | null;
};

type ModalType =
	| typeof FREE_PLAN_FREE_DOMAIN_DIALOG
	| typeof FREE_PLAN_PAID_DOMAIN_DIALOG
	| typeof PAID_PLAN_IS_REQUIRED_DIALOG
	| typeof MODAL_LOADER;

/**
 * Provides a callback that resolves a ModalType based on a set of predefined parameters
 */
export function useModalResolutionCallback( { paidDomainName, flowName }: Props ) {
	const isCustomDomainAllowedOnFreePlan = useIsCustomDomainAllowedOnFreePlan( flowName );
	return useCallback(
		( currentSelectedPlan?: string | null ): ModalType | null => {
			if ( currentSelectedPlan && flowName && isFreePlan( currentSelectedPlan ) ) {
				if ( ! paidDomainName ) {
					return FREE_PLAN_FREE_DOMAIN_DIALOG;
				}

				if ( isCustomDomainAllowedOnFreePlan.result ) {
					return FREE_PLAN_PAID_DOMAIN_DIALOG;
				}

				/**
				 * Either this or the above modal to be removed
				 * after experiment 21394-explat-experiment is over
				 */
				return PAID_PLAN_IS_REQUIRED_DIALOG;
			}
			return null;
		},
		[ flowName, isCustomDomainAllowedOnFreePlan.result, paidDomainName ]
	);
}
