import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { PlanChangeLostFeature } from '@automattic/api-core';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

function useFeatureTitle(): ( slug: string ) => TranslateResult {
	const translate = useTranslate();

	const titles: Record< string, TranslateResult > = {
		donations: translate( 'Donations block' ),
		'payment-buttons': translate( 'Payment button block' ),
		'paypal-payment-buttons': translate( 'PayPal Payment button block' ),
		'field-file': translate( 'File upload field' ),
		'multistep-form': translate( 'Multi-step forms' ),
		'form-integrations': translate( 'Conditional logic' ),
	};

	return ( slug: string ) => titles[ slug ] ?? slug;
}

interface FeatureLossConfirmationModalProps {
	isOpen: boolean;
	/** Plan slugs, for analytics only; the copy uses the names below. */
	currentPlanSlug?: string | null;
	targetPlanSlug?: string | null;
	/** Name of the plan the site is on today, which carries the legacy feature set. */
	currentPlanName: string;
	targetPlanName: string;
	/** Features the site would lose, as returned by the plan-change endpoint. */
	lostFeatures: PlanChangeLostFeature[];
	onClose: () => void;
	onConfirm: () => void;
}

/**
 * Warns before checkout that moving plan would remove a feature the site uses.
 *
 * A site still on the pre-2026 feature gating holds the union of the old and new feature sets, and
 * graduates to the new set when it changes plan — so even an upgrade can take a feature away.
 *
 * Purely presentational, unlike its sibling downgrade-confirmation-modal: that one opens before its
 * data is ready and so runs its own query with a spinner, whereas this modal only exists at all once
 * the parent has the answer — whether to open it *is* the answer.
 */
export default function FeatureLossConfirmationModal( {
	isOpen,
	currentPlanSlug,
	targetPlanSlug,
	currentPlanName,
	targetPlanName,
	lostFeatures,
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
				translate( 'Moving to %(targetPlan)s updates your feature set', {
					args: { targetPlan: targetPlanName },
					comment: 'Title of the modal shown when a plan change removes features the site uses',
				} ) as string
			}
			onRequestClose={ onClose }
			className="feature-loss-confirmation-modal"
		>
			<p className="feature-loss-confirmation-modal__description">
				{ translate(
					'Your site is on an older %(currentPlan)s plan, with a legacy feature set. The following features are currently not included in a %(targetPlan)s plan:',
					{
						args: { currentPlan: currentPlanName, targetPlan: targetPlanName },
						comment:
							'Intro line before the list of features a plan change would remove; both arguments are plan names',
					}
				) }
			</p>
			<ul className="feature-loss-confirmation-modal__feature-list">
				{ lostFeatures.map( ( { feature } ) => (
					<li key={ feature } className="feature-loss-confirmation-modal__feature-item">
						{ featureTitle( feature ) }
					</li>
				) ) }
			</ul>
			<p className="feature-loss-confirmation-modal__support-link">
				<a
					href={ localizeUrl( 'https://wordpress.com/support/plan-features/' ) }
					target="_blank"
					rel="noreferrer"
					onClick={ () =>
						recordTracksEvent( 'calypso_plans_legacy_feature_modal_support_link_click', {
							current_plan: currentPlanSlug,
							target_plan: targetPlanSlug,
						} )
					}
				>
					{ translate( 'See what’s included in each plan' ) }
				</a>
			</p>
			<div className="feature-loss-confirmation-modal__actions">
				<Button variant="tertiary" onClick={ onClose }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onConfirm }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</Modal>
	);
}
