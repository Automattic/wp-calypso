import { PLAN_PERSONAL, PlanSlug } from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { DomainSuggestions } from '@automattic/data-stores';
import { Global, css } from '@emotion/react';
import { FreePlanFreeDomainDialog } from './free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './free-plan-paid-domain-dialog';
import { useModalResolutionCallback } from './hooks/use-modal-resolution-callback';
import PaidPlanIsRequiredDialog from './paid-plan-is-required-dialog';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

export const PAID_PLAN_IS_REQUIRED_DIALOG = 'PAID_PLAN_IS_REQUIRED_DIALOG';
export const FREE_PLAN_PAID_DOMAIN_DIALOG = 'FREE_PLAN_PAID_DOMAIN_DIALOG';
export const FREE_PLAN_FREE_DOMAIN_DIALOG = 'FREE_PLAN_FREE_DOMAIN_DIALOG';
export const MODAL_LOADER = 'MODAL_LOADER';

export type DomainPlanDialogProps = {
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

function DisplayedModal( {
	paidDomainName,
	selectedPlan,
	wpcomFreeDomainSuggestion,
	onFreePlanSelected,
	onPlanSelected,
}: ModalContainerProps ) {
	const resolveModal = useModalResolutionCallback( { paidDomainName } );

	switch ( resolveModal( selectedPlan ) ) {
		case FREE_PLAN_PAID_DOMAIN_DIALOG:
			return (
				<FreePlanPaidDomainDialog
					paidDomainName={ paidDomainName as string }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
					suggestedPlanSlug={ PLAN_PERSONAL }
					onFreePlanSelected={ () => {
						onFreePlanSelected();
					} }
					onPlanSelected={ () => {
						onPlanSelected( PLAN_PERSONAL );
					} }
				/>
			);
		case FREE_PLAN_FREE_DOMAIN_DIALOG:
			return (
				<FreePlanFreeDomainDialog
					suggestedPlanSlug={ PLAN_PERSONAL }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
					onFreePlanSelected={ onFreePlanSelected }
					onPlanSelected={ () => {
						onPlanSelected( PLAN_PERSONAL );
					} }
				/>
			);
		case PAID_PLAN_IS_REQUIRED_DIALOG:
			return (
				<PaidPlanIsRequiredDialog
					paidDomainName={ paidDomainName as string }
					suggestedPlanSlug={ PLAN_PERSONAL }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
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

export default function ModalContainer( props: ModalContainerProps ) {
	if ( ! props.isModalOpen ) {
		return;
	}
	return (
		<Dialog
			isBackdropVisible={ true }
			isVisible={ true }
			onClose={ props.onClose }
			showCloseIcon={ true }
			labelledby="free-plan-modal-title"
			describedby="free-plan-modal-description"
		>
			<Global
				styles={ css`
					.dialog__backdrop.is-full-screen {
						background-color: rgba( 0, 0, 0, 0.6 );
					}
					.ReactModal__Content--after-open.dialog.card {
						border-radius: 4px;
						width: 639px;
					}
				` }
			/>
			<DisplayedModal { ...props } />
		</Dialog>
	);
}
