import { PLAN_PERSONAL, PlanSlug } from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { DomainSuggestions } from '@automattic/data-stores';
import { Global, css } from '@emotion/react';
import { FreePlanFreeDomainDialog } from './free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './free-plan-paid-domain-dialog';
import PaidPlanIsRequiredDialog from './paid-plan-is-required-dialog';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

export const PAID_PLAN_IS_REQUIRED_DIALOG = 'PAID_PLAN_IS_REQUIRED_DIALOG';
export const FREE_PLAN_PAID_DOMAIN_DIALOG = 'FREE_PLAN_PAID_DOMAIN_DIALOG';
export const FREE_PLAN_FREE_DOMAIN_DIALOG = 'FREE_PLAN_FREE_DOMAIN_DIALOG';
export const MODAL_LOADER = 'MODAL_LOADER';

export type ModalType =
	| typeof FREE_PLAN_FREE_DOMAIN_DIALOG
	| typeof FREE_PLAN_PAID_DOMAIN_DIALOG
	| typeof PAID_PLAN_IS_REQUIRED_DIALOG
	| typeof MODAL_LOADER;

export type DomainPlanDialogProps = {
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >;
	suggestedPlanSlug: PlanSlug;
	onFreePlanSelected: ( isDomainRetained?: boolean ) => void;
	onPlanSelected: () => void;
};

type ModalContainerProps = {
	isModalOpen: boolean;
	paidDomainName?: string;
	modalType?: ModalType | null;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestions.DomainSuggestion >;
	onClose: () => void;
	onFreePlanSelected: ( isDomainRetained?: boolean ) => void;
	onPlanSelected: ( planSlug: string ) => void;
};

// See p2-pbxNRc-2Ri#comment-4703 for more context
export const MODAL_VIEW_EVENT_NAME = 'calypso_plan_upsell_modal_view';

function DisplayedModal( {
	paidDomainName,
	modalType,
	wpcomFreeDomainSuggestion,
	onFreePlanSelected,
	onPlanSelected,
}: Omit< ModalContainerProps, 'selectedPlan' > ) {
	switch ( modalType ) {
		case FREE_PLAN_PAID_DOMAIN_DIALOG:
			return (
				<FreePlanPaidDomainDialog
					paidDomainName={ paidDomainName as string }
					wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
					suggestedPlanSlug={ PLAN_PERSONAL }
					onFreePlanSelected={ onFreePlanSelected }
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
	const { isModalOpen, modalType } = props;
	if ( ! isModalOpen || ! modalType ) {
		return;
	}

	const modalWidth = () => {
		switch ( modalType ) {
			case FREE_PLAN_PAID_DOMAIN_DIALOG:
			case FREE_PLAN_FREE_DOMAIN_DIALOG:
				return '605px';
			case PAID_PLAN_IS_REQUIRED_DIALOG:
			default:
				return '639px';
		}
	};
	return (
		<Dialog
			isBackdropVisible={ true }
			isVisible={ true }
			onClose={ props.onClose }
			showCloseIcon={ true }
			labelledby="plan-upsell-modal-title"
			describedby="plan-upsell-modal-description"
		>
			<Global
				styles={ css`
					.dialog__backdrop.is-full-screen {
						background-color: rgba( 0, 0, 0, 0.6 );
					}
					.ReactModal__Content--after-open.dialog.card {
						border-radius: 4px;
						width: ${ modalWidth() };
					}
				` }
			/>
			<DisplayedModal { ...props } />
		</Dialog>
	);
}
