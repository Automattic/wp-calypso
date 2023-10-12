import { PLAN_PERSONAL, PlanSlug } from '@automattic/calypso-products';
import { DomainSuggestions } from '@automattic/data-stores';
import { FreePlanFreeDomainDialog } from './free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './free-plan-paid-domain-dialog';
import { useModalResolutionCallback } from './hooks/use-modal-resolution-callback';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

export const PAID_DOMAIN_PAID_PLAN_REQUIRED = 'PAID_DOMAIN_PAID_PLAN_REQUIRED';
export const PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL = 'PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL';
export const FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL = 'FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL';
export const MODAL_LOADER = 'MODAL_LOADER';

export type DomainPlanDialogProps = {
	paidDomainName: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >;
	suggestedPlanSlug: PlanSlug;
	onFreePlanSelected: () => void;
	onPlanSelected: () => void;
};

type ModalContainerProps = {
	isModalOpen: boolean;
	paidDomainName?: string;
	selectedPlan: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestions.DomainSuggestion >;
	flowName: string;
	onClose: () => void;
	onFreePlanSelected: () => void;
	onPlanSelected: ( planSlug: string ) => void;
};

// See p2-pbxNRc-2Ri#comment-4703 for more context
export const MODAL_VIEW_EVENT_NAME = 'calypso_plan_upsell_modal_view';

export default function ModalContainer( {
	isModalOpen,
	paidDomainName,
	selectedPlan,
	wpcomFreeDomainSuggestion,
	onClose,
	onFreePlanSelected,
	onPlanSelected,
}: ModalContainerProps ) {
	const resolveModal = useModalResolutionCallback( { paidDomainName } );

	if ( ! isModalOpen ) {
		return;
	}
	switch ( resolveModal( selectedPlan ) ) {
		case PAID_DOMAIN_FREE_PLAN_SELECTED_MODAL:
			return (
				<FreePlanPaidDomainDialog
					paidDomainName={ paidDomainName as string }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
					suggestedPlanSlug={ PLAN_PERSONAL }
					onClose={ onClose }
					onFreePlanSelected={ () => {
						onFreePlanSelected();
					} }
					onPlanSelected={ () => {
						onPlanSelected( PLAN_PERSONAL );
					} }
				/>
			);
		case FREE_DOMAIN_FREE_PLAN_SELECTED_MODAL:
			return (
				<FreePlanFreeDomainDialog
					suggestedPlanSlug={ PLAN_PERSONAL }
					freeSubdomain={ wpcomFreeDomainSuggestion }
					onClose={ onClose }
					onFreePlanSelected={ onFreePlanSelected }
					onPlanSelected={ () => {
						onPlanSelected( PLAN_PERSONAL );
					} }
				/>
			);
		default:
			break;
	}

	return null;
}
