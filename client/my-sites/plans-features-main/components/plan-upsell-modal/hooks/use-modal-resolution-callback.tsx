import { isFreePlan } from '@automattic/calypso-products';
import { useCallback } from 'react';
import useIsCustomDomainAllowedOnFreePlan from 'calypso/my-sites/plans-features-main/hooks/use-is-custom-domain-allowed-on-free-plan';
import {
	PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL,
	FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL,
	MODAL_LOADER,
	PAID_DOMAIN_PAID_PLAN_REQUIRED,
} from '..';
type Props = {
	paidDomainName?: string | null;
	flowName?: string;
};

type ModalType =
	| typeof PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL
	| typeof FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL
	| typeof PAID_DOMAIN_PAID_PLAN_REQUIRED
	| typeof MODAL_LOADER;

/**
 * Provides a callback that resolves a ModalType based on a set of predefined parameters
 */
export function useModalResolutionCallback( {
	paidDomainName,
	flowName,
}: Props ): ( currentSelectedPlan: string ) => ModalType | null {
	const isCustomDomainAllowedOnFreePlan = useIsCustomDomainAllowedOnFreePlan(
		flowName,
		!! paidDomainName
	);
	return useCallback(
		( currentSelectedPlan: string ): ModalType | null => {
			if ( isFreePlan( currentSelectedPlan ) ) {
				if ( ! paidDomainName ) {
					return FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL;
				}

				if ( isCustomDomainAllowedOnFreePlan ) {
					return PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL;
				}

				/**
				 * Either this or the above modal to be removed
				 * after experiment 21394-explat-experiment is over
				 */
				return PAID_DOMAIN_PAID_PLAN_REQUIRED;
			}
			return null;
		},
		[ isCustomDomainAllowedOnFreePlan, paidDomainName ]
	);
}
