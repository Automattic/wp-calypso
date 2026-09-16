import { Gridicon, Spinner } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { PlanChangeLostFeature } from '@automattic/api-core';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

function useFeatureTitle(): ( slug: string ) => TranslateResult {
	const translate = useTranslate();

	const titles: Record< string, TranslateResult > = {
		donations: translate( 'Donations' ),
		'payment-buttons': translate( 'Payment buttons' ),
		'paypal-payment-buttons': translate( 'PayPal payment buttons' ),
		payments: translate( 'Payments' ),
		'field-file': translate( 'File upload form field' ),
		'multistep-form': translate( 'Multi-step forms' ),
		'form-integrations': translate( 'Form integrations' ),
	};

	return ( slug: string ) => titles[ slug ] ?? slug;
}

interface FeatureLossConfirmationModalProps {
	isOpen: boolean;
	isLoading?: boolean;
	targetPlanName: string;
	/** Features the site would lose, as returned by the plan-change endpoint. */
	lostFeatures: PlanChangeLostFeature[];
	/** Feature slugs the target plan adds, so the change does not read as all downside. */
	gainedFeatures?: string[];
	onClose: () => void;
	onConfirm: () => void;
}

/**
 * Warns before checkout that upgrading would remove a feature the site uses.
 *
 * A site still on the pre-2026 feature gating holds the union of the old and new feature sets, and
 * graduates to the new set when it changes plan — so an upgrade can take a feature away. Sibling of
 * downgrade-confirmation-modal, which does the same job for the downgrade direction.
 */
export default function FeatureLossConfirmationModal( {
	isOpen,
	isLoading,
	targetPlanName,
	lostFeatures,
	gainedFeatures = [],
	onClose,
	onConfirm,
}: FeatureLossConfirmationModalProps ) {
	const translate = useTranslate();
	const featureTitle = useFeatureTitle();

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={
				translate( 'Upgrading to %(targetPlan)s changes your features', {
					args: { targetPlan: targetPlanName },
					comment: 'Title of the modal warning that an upgrade removes features the site uses',
				} ) as string
			}
			onRequestClose={ onClose }
			className="feature-loss-confirmation-modal"
		>
			{ isLoading ? (
				<div className="feature-loss-confirmation-modal__loading">
					<Spinner />
				</div>
			) : (
				<>
					<p className="feature-loss-confirmation-modal__description">
						{ translate(
							'Your site uses features that the %(targetPlan)s plan does not include. If you continue, you will lose:',
							{
								args: { targetPlan: targetPlanName },
								comment: 'Intro line before the list of features an upgrade would remove',
							}
						) }
					</p>
					<ul className="feature-loss-confirmation-modal__feature-list">
						{ lostFeatures.map( ( { feature } ) => (
							<li key={ feature } className="feature-loss-confirmation-modal__feature-item">
								<Gridicon icon="cross-small" size={ 18 } />
								<span>{ featureTitle( feature ) }</span>
							</li>
						) ) }
					</ul>
					{ gainedFeatures.length > 0 && (
						<>
							<p className="feature-loss-confirmation-modal__description">
								{ translate( 'You will also gain:', {
									comment: 'Intro line before the list of features an upgrade adds',
								} ) }
							</p>
							<ul className="feature-loss-confirmation-modal__feature-list">
								{ gainedFeatures.map( ( feature ) => (
									<li
										key={ feature }
										className="feature-loss-confirmation-modal__feature-item is-gained"
									>
										<Gridicon icon="checkmark" size={ 18 } />
										<span>{ featureTitle( feature ) }</span>
									</li>
								) ) }
							</ul>
						</>
					) }
				</>
			) }
			<div className="feature-loss-confirmation-modal__actions">
				<Button variant="tertiary" onClick={ onClose }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onConfirm } disabled={ isLoading }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</Modal>
	);
}
