import { PlanSlug } from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { Global, css } from '@emotion/react';
import { FreePlanFreeDomainDialog } from './free-plan-free-domain-dialog';
import { FreePlanPaidDomainDialog } from './free-plan-paid-domain-dialog';
import { PaidPlanIsRequiredDialog } from './paid-plan-is-required-dialog';
import { PaidPlanPaidDomainDialog } from './paid-plan-paid-domain-dialog';
import type { DataResponse } from '@automattic/plans-grid-next';

export const PAID_PLAN_IS_REQUIRED_DIALOG = 'PAID_PLAN_IS_REQUIRED_DIALOG';
export const FREE_PLAN_PAID_DOMAIN_DIALOG = 'FREE_PLAN_PAID_DOMAIN_DIALOG';
export const FREE_PLAN_FREE_DOMAIN_DIALOG = 'FREE_PLAN_FREE_DOMAIN_DIALOG';
export const PAID_PLAN_PAID_DOMAIN_DIALOG = 'PAID_PLAN_FREE_DOMAIN_DIALOG';
export const MODAL_LOADER = 'MODAL_LOADER';

export type ModalType =
	| typeof FREE_PLAN_FREE_DOMAIN_DIALOG
	| typeof FREE_PLAN_PAID_DOMAIN_DIALOG
	| typeof PAID_PLAN_PAID_DOMAIN_DIALOG
	| typeof PAID_PLAN_IS_REQUIRED_DIALOG
	| typeof MODAL_LOADER;

export type DomainPlanDialogProps = {
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	selectedThemeType?: string;
	upsellPremiumPlan?: boolean;
	onFreePlanSelected: ( isDomainRetained?: boolean ) => void;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
};

type ModalContainerProps = {
	isModalOpen: boolean;
	modalType?: ModalType | null;
	onClose: () => void;
} & DomainPlanDialogProps;

// See p2-pbxNRc-2Ri#comment-4703 for more context
export const MODAL_VIEW_EVENT_NAME = 'calypso_plan_upsell_modal_view';

function getDisplayedModal( modalType: ModalType, dialogProps: DomainPlanDialogProps ) {
	switch ( modalType ) {
		case FREE_PLAN_PAID_DOMAIN_DIALOG:
			return <FreePlanPaidDomainDialog { ...dialogProps } />;
		case FREE_PLAN_FREE_DOMAIN_DIALOG:
			return <FreePlanFreeDomainDialog { ...dialogProps } />;
		case PAID_PLAN_PAID_DOMAIN_DIALOG:
			return <PaidPlanPaidDomainDialog { ...dialogProps } />;
		case PAID_PLAN_IS_REQUIRED_DIALOG:
			return <PaidPlanIsRequiredDialog { ...dialogProps } />;
		default:
			return null;
	}
}

export default function PlanUpsellModal( props: ModalContainerProps ) {
	const { isModalOpen, modalType } = props;

	if ( ! modalType ) {
		return null;
	}

	const modalWidth = () => {
		switch ( modalType ) {
			case FREE_PLAN_PAID_DOMAIN_DIALOG:
			case FREE_PLAN_FREE_DOMAIN_DIALOG:
				return '605px';
			case PAID_PLAN_PAID_DOMAIN_DIALOG:
			case PAID_PLAN_IS_REQUIRED_DIALOG:
			default:
				return '700px';
		}
	};
	return (
		<Dialog
			isBackdropVisible
			isVisible={ isModalOpen && !! modalType }
			onClose={ props.onClose }
			showCloseIcon
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
			{ getDisplayedModal( modalType, props ) }
		</Dialog>
	);
}
