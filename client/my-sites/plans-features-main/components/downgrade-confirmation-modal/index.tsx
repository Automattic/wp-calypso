import { purchaseCancelFeaturesQuery } from '@automattic/api-queries';
import { Gridicon, Spinner } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, Notice } from '@wordpress/components';
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
	/**
	 * When true, the downgrade is scheduled for end-of-term rather than
	 * performed immediately. The confirm button reflects the scheduled nature.
	 */
	isDelayedDowngrade?: boolean;
	/**
	 * Pre-formatted, localized date of the next renewal (e.g. "January 1, 2026"),
	 * when the scheduled downgrade will take effect. Shown for delayed downgrades.
	 */
	renewalDate?: string;
	/** Pre-formatted, localized refund amount (e.g. "$48.00"). */
	refundText?: string;
	/** When true, the confirm action is in flight; disable buttons and show a spinner. */
	isConfirming?: boolean;
	/**
	 * When false and isDelayedDowngrade is true, shows a notice that a rechargeable
	 * payment method is required and disables the confirm button.
	 */
	isRechargeable?: boolean;
	/** URL to the change payment method page, linked from the rechargeable payment notice. */
	changePaymentMethodUrl?: string;
	onClose: () => void;
	onConfirm: () => void;
}

function ModalBody( {
	isLoading,
	currentPlanName,
	targetPlanName,
	lostFeatures,
	isInstantDowngrade,
	isDelayedDowngrade,
	renewalDate,
	refundText,
	isRechargeable,
	changePaymentMethodUrl,
}: {
	isLoading: boolean;
	currentPlanName: string;
	targetPlanName: string;
	lostFeatures: { feature_id: string; title: string }[];
	isInstantDowngrade?: boolean;
	isDelayedDowngrade?: boolean;
	renewalDate?: string;
	refundText?: string;
	isRechargeable?: boolean;
	changePaymentMethodUrl?: string;
} ) {
	const translate = useTranslate();

	if ( isLoading ) {
		return (
			<div className="downgrade-confirmation-modal__loading">
				<Spinner />
			</div>
		);
	}

	if ( isDelayedDowngrade ) {
		return (
			<>
				{ isRechargeable === false && (
					<Notice
						status="warning"
						isDismissible={ false }
						className="downgrade-confirmation-modal__payment-notice"
					>
						{ translate( 'Scheduling a downgrade requires a rechargeable payment method.', {
							comment: 'Notice shown when the subscription has no rechargeable payment method',
						} ) }
						{ changePaymentMethodUrl && (
							<>
								<br />
								<a href={ changePaymentMethodUrl }>
									{ translate( 'Add or change payment method', {
										comment: 'Link to the change payment method page',
									} ) }
								</a>
							</>
						) }
					</Notice>
				) }
				<p className="downgrade-confirmation-modal__description">
					{ renewalDate
						? translate(
								'Your plan will change from %(currentPlan)s to %(targetPlan)s at your next renewal on %(renewalDate)s. Until then you’ll continue using %(currentPlan)s.',
								{
									args: {
										currentPlan: currentPlanName,
										targetPlan: targetPlanName,
										renewalDate,
									},
									comment:
										'Message shown when scheduling a plan downgrade for a specific renewal date',
								}
						  )
						: translate(
								'Your plan will change from %(currentPlan)s to %(targetPlan)s at your next renewal. Until then you’ll continue using %(currentPlan)s.',
								{
									args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
									comment:
										'Message shown when scheduling a plan downgrade for end of the current billing term',
								}
						  ) }
				</p>
				{ lostFeatures.length > 0 && (
					<>
						<p className="downgrade-confirmation-modal__description">
							{ translate( 'When the change takes effect, here’s what you’ll lose:', {
								comment:
									'Intro line before the list of features that will be lost at the delayed downgrade',
							} ) }
						</p>
						<ul className="downgrade-confirmation-modal__feature-list">
							{ lostFeatures.map( ( feature ) => (
								<li
									key={ feature.feature_id }
									className="downgrade-confirmation-modal__feature-item"
								>
									<Gridicon
										icon="cross-small"
										size={ 24 }
										className="downgrade-confirmation-modal__feature-icon"
									/>
									<span className="downgrade-confirmation-modal__feature-text">
										{ feature.title }
									</span>
								</li>
							) ) }
						</ul>
					</>
				) }
			</>
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
	isDelayedDowngrade,
	renewalDate,
	refundText,
	isConfirming,
	isRechargeable,
	changePaymentMethodUrl,
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

	const title = isDelayedDowngrade
		? String( translate( 'Schedule downgrade' ) )
		: String( translate( 'Confirm downgrade' ) );

	const confirmButtonLabel = ( () => {
		if ( isDelayedDowngrade ) {
			return translate( 'Schedule downgrade', {
				comment: 'Button label to confirm scheduling a plan downgrade for end of billing term',
			} );
		}
		if ( isInstantDowngrade && refundText ) {
			return translate( 'Downgrade and refund %(refundText)s', {
				args: { refundText },
				comment:
					'Button label to confirm an instant downgrade that issues a refund of the given amount',
			} );
		}
		return translate( 'Downgrade', {
			comment: 'Button label to confirm downgrading to a lower-tier plan',
		} );
	} )();

	return (
		<Modal
			title={ title }
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
				isDelayedDowngrade={ isDelayedDowngrade }
				renewalDate={ renewalDate }
				refundText={ refundText }
				isRechargeable={ isRechargeable }
				changePaymentMethodUrl={ changePaymentMethodUrl }
			/>
			<div className="downgrade-confirmation-modal__buttons">
				<span className="downgrade-confirmation-modal__plan-transition">
					{ translate( '%(currentPlan)s → %(targetPlan)s', {
						args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
						comment: 'Plan transition summary shown above the downgrade confirm/cancel buttons',
					} ) }
				</span>
				<div className="downgrade-confirmation-modal__button-row">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ onClose }
						disabled={ isConfirming }
					>
						{ translate( 'Keep plan', {
							comment: 'Button label to dismiss the downgrade modal and keep the current plan',
						} ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ onConfirm }
						isBusy={ isConfirming }
						disabled={ isConfirming || ( isDelayedDowngrade && isRechargeable === false ) }
					>
						{ confirmButtonLabel }
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
