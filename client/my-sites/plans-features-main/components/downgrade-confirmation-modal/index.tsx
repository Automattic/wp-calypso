import { purchaseCancelFeaturesQuery } from '@automattic/api-queries';
import { Gridicon, Spinner } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface DowngradeConfirmationModalProps {
	isOpen: boolean;
	currentPlanName: string;
	targetPlanName: string;
	targetPlanSlug: string | null;
	purchaseId: number | undefined;
	/**
	 * When true, the downgrade is performed instantly (paid out of the refund)
	 * rather than routed to checkout. The refund amount is displayed and the
	 * confirm button reflects the refund.
	 */
	isInstantDowngrade?: boolean;
	/** Pre-formatted, localized refund amount (e.g. "$48.00"). */
	refundText?: string;
	/** When true, the confirm action is in flight; disable buttons and show a spinner. */
	isConfirming?: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

function ModalBody( {
	isLoading,
	currentPlanName,
	targetPlanName,
	lostFeatures,
	isInstantDowngrade,
	refundText,
}: {
	isLoading: boolean;
	currentPlanName: string;
	targetPlanName: string;
	lostFeatures: { feature_id: string; title: string }[];
	isInstantDowngrade?: boolean;
	refundText?: string;
} ) {
	const translate = useTranslate();

	if ( isLoading ) {
		return (
			<div className="downgrade-confirmation-modal__loading">
				<Spinner />
			</div>
		);
	}

	const refundLine = isInstantDowngrade && refundText && (
		<p className="downgrade-confirmation-modal__refund">
			{ translate( 'You will be refunded %(refundText)s.', {
				args: { refundText },
				comment: 'Message shown when downgrading a plan that is within its refund window',
			} ) }
		</p>
	);

	if ( lostFeatures.length === 0 ) {
		return (
			<>
				<p className="downgrade-confirmation-modal__description">
					{ translate(
						'When you change from %(currentPlan)s to %(targetPlan)s, your features will stay the same.',
						{
							args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
							comment: 'Message shown when downgrading an expired plan with no feature differences',
						}
					) }
				</p>
				{ refundLine }
			</>
		);
	}

	return (
		<>
			<p className="downgrade-confirmation-modal__description">
				{ translate(
					"When you change from %(currentPlan)s to %(targetPlan)s, here's what you'll lose:",
					{
						args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
						comment:
							'Message shown when downgrading an expired plan, listing features that will be lost',
					}
				) }
			</p>
			<ul className="downgrade-confirmation-modal__feature-list">
				{ lostFeatures.map( ( feature ) => (
					<li key={ feature.feature_id } className="downgrade-confirmation-modal__feature-item">
						<Gridicon
							icon="cross-small"
							size={ 24 }
							className="downgrade-confirmation-modal__feature-icon"
						/>
						<span className="downgrade-confirmation-modal__feature-text">{ feature.title }</span>
					</li>
				) ) }
			</ul>
			{ refundLine }
		</>
	);
}

const DowngradeConfirmationModal = ( {
	isOpen,
	currentPlanName,
	targetPlanName,
	targetPlanSlug,
	purchaseId,
	isInstantDowngrade,
	refundText,
	isConfirming,
	onClose,
	onConfirm,
}: DowngradeConfirmationModalProps ) => {
	const translate = useTranslate();

	const { data: cancelFeaturesData, isLoading } = useQuery( {
		...purchaseCancelFeaturesQuery( purchaseId ?? 0, 'control', targetPlanSlug ?? undefined ),
		enabled: !! purchaseId && !! targetPlanSlug && isOpen,
		// The feature delta is fixed for the dialog's lifetime. Don't refetch on
		// window focus: in the instant-downgrade flow the dialog stays open (with its
		// loader) until the redirect, and a focus refetch after the downgrade has
		// completed would return an empty delta and wipe out the displayed list.
		refetchOnWindowFocus: false,
		staleTime: Infinity,
	} );

	if ( ! targetPlanSlug || ! isOpen ) {
		return null;
	}

	const lostFeatures = cancelFeaturesData?.features ?? [];

	return (
		<Modal
			title={ String( translate( 'Confirm downgrade' ) ) }
			onRequestClose={ onClose }
			className="downgrade-confirmation-modal"
			size="medium"
		>
			<ModalBody
				isLoading={ isLoading }
				currentPlanName={ currentPlanName }
				targetPlanName={ targetPlanName }
				lostFeatures={ lostFeatures }
				isInstantDowngrade={ isInstantDowngrade }
				refundText={ refundText }
			/>
			<div className="downgrade-confirmation-modal__buttons">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ onClose }
					disabled={ isConfirming }
				>
					{ translate( 'Keep %(planName)s', {
						args: { planName: currentPlanName },
						comment: 'Button label to dismiss the downgrade modal and keep the current plan',
					} ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onConfirm }
					isBusy={ isConfirming }
					disabled={ isConfirming }
				>
					{ isInstantDowngrade && refundText
						? translate( 'Downgrade and refund %(refundText)s', {
								args: { refundText },
								comment:
									'Button label to confirm an instant downgrade that issues a refund of the given amount',
						  } )
						: translate( 'Downgrade to %(planName)s', {
								args: { planName: targetPlanName },
								comment: 'Button label to confirm downgrading to a lower-tier plan',
						  } ) }
				</Button>
			</div>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
