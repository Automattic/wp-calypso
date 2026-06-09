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
	onClose: () => void;
	onConfirm: () => void;
}

function ModalBody( {
	isLoading,
	currentPlanName,
	targetPlanName,
	lostFeatures,
}: {
	isLoading: boolean;
	currentPlanName: string;
	targetPlanName: string;
	lostFeatures: { feature_id: string; title: string }[];
} ) {
	const translate = useTranslate();

	if ( isLoading ) {
		return (
			<div className="downgrade-confirmation-modal__loading">
				<Spinner />
			</div>
		);
	}

	if ( lostFeatures.length === 0 ) {
		return (
			<p className="downgrade-confirmation-modal__description">
				{ translate(
					'When you change from %(currentPlan)s to %(targetPlan)s, your features will stay the same.',
					{
						args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
						comment: 'Message shown when downgrading an expired plan with no feature differences',
					}
				) }
			</p>
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
		</>
	);
}

const DowngradeConfirmationModal = ( {
	isOpen,
	currentPlanName,
	targetPlanName,
	targetPlanSlug,
	purchaseId,
	onClose,
	onConfirm,
}: DowngradeConfirmationModalProps ) => {
	const translate = useTranslate();

	const { data: cancelFeaturesData, isLoading } = useQuery( {
		...purchaseCancelFeaturesQuery( purchaseId ?? 0, 'control', targetPlanSlug ?? undefined ),
		enabled: !! purchaseId && !! targetPlanSlug && isOpen,
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
			/>
			<div className="downgrade-confirmation-modal__buttons">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
					{ translate( 'Keep %(planName)s', {
						args: { planName: currentPlanName },
						comment: 'Button label to dismiss the downgrade modal and keep the current plan',
					} ) }
				</Button>
				<Button __next40pxDefaultSize variant="primary" onClick={ onConfirm }>
					{ translate( 'Downgrade to %(planName)s', {
						args: { planName: targetPlanName },
						comment: 'Button label to confirm downgrading to a lower-tier plan',
					} ) }
				</Button>
			</div>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
