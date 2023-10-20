import { PLAN_PERSONAL, PlanSlug } from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { Global, css } from '@emotion/react';
import { FreePlanFreeDomainDialog } from './free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './free-plan-paid-domain-dialog';
import MonthlyPlanDontMissOutDialog from './monthly-plan-dont-miss-out-dialog';
import MonthlyPlanSaveUptoDialog from './monthly-plan-save-upto-dialog';
import PaidPlanIsRequiredDialog from './paid-plan-is-required-dialog';
import type { DataResponse } from 'calypso/my-sites/plans-grid/types';

export const PAID_PLAN_IS_REQUIRED_DIALOG = 'PAID_PLAN_IS_REQUIRED_DIALOG';
export const FREE_PLAN_PAID_DOMAIN_DIALOG = 'FREE_PLAN_PAID_DOMAIN_DIALOG';
export const FREE_PLAN_FREE_DOMAIN_DIALOG = 'FREE_PLAN_FREE_DOMAIN_DIALOG';
export const MONTHLY_PLAN_DONT_MISS_OUT_DIALOG = 'MONTHLY_PLAN_DONT_MISS_OUT_DIALOG';
export const MONTHLY_PLAN_SAVE_UPTO_DIALOG = 'MONTHLY_PLAN_SAVE_UPTO_DIALOG';
export const MODAL_LOADER = 'MODAL_LOADER';

export type ModalType =
	| typeof FREE_PLAN_FREE_DOMAIN_DIALOG
	| typeof FREE_PLAN_PAID_DOMAIN_DIALOG
	| typeof PAID_PLAN_IS_REQUIRED_DIALOG
	| typeof MONTHLY_PLAN_DONT_MISS_OUT_DIALOG
	| typeof MONTHLY_PLAN_SAVE_UPTO_DIALOG
	| typeof MODAL_LOADER;

export type DomainPlanDialogProps = {
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	suggestedPlanSlug: PlanSlug;
	onFreePlanSelected: ( isDomainRetained?: boolean ) => void;
	onPlanSelected: () => void;
};

type ModalContainerProps = {
	isModalOpen: boolean;
	paidDomainName?: string;
	modalType?: ModalType | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	onClose: () => void;
	onFreePlanSelected: ( isDomainRetained?: boolean ) => void;
	onPlanSelected: ( planSlug: string ) => void;
};

// See p2-pbxNRc-2Ri#comment-4703 for more context
export const MODAL_VIEW_EVENT_NAME = 'calypso_plan_upsell_modal_view';

function DisplayedModal( {
	paidDomainName,
	modalType,
	generatedWPComSubdomain,
	onFreePlanSelected,
	onPlanSelected,
}: Omit< ModalContainerProps, 'selectedPlan' > ) {
	switch ( modalType ) {
		case FREE_PLAN_PAID_DOMAIN_DIALOG:
			return (
				<FreePlanPaidDomainDialog
					paidDomainName={ paidDomainName as string }
					generatedWPComSubdomain={ generatedWPComSubdomain }
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
					generatedWPComSubdomain={ generatedWPComSubdomain }
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
					generatedWPComSubdomain={ generatedWPComSubdomain }
					onFreePlanSelected={ onFreePlanSelected }
					onPlanSelected={ () => {
						onPlanSelected( PLAN_PERSONAL );
					} }
				/>
			);
		case MONTHLY_PLAN_DONT_MISS_OUT_DIALOG:
			return <MonthlyPlanDontMissOutDialog />;
		case MONTHLY_PLAN_SAVE_UPTO_DIALOG:
			return <MonthlyPlanSaveUptoDialog />;
		default:
			break;
	}

	return null;
}

export default function ModalContainer( props: ModalContainerProps ) {
	const { isModalOpen, modalType } = props;

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
			isVisible={ isModalOpen && !! modalType }
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
