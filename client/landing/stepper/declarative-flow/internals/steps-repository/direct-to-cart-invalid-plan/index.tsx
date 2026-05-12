import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step as StepType } from '../../types';
import './style.scss';

const DirectToCartInvalidPlan: StepType = function DirectToCartInvalidPlan() {
	const { __ } = useI18n();

	return (
		<>
			<DocumentHead title={ __( 'Unsupported plan' ) } />
			<div className="direct-to-cart-invalid-plan">
				<h1 className="direct-to-cart-invalid-plan__heading">
					{ __( "This link doesn't offer that plan" ) }
				</h1>
				<p className="direct-to-cart-invalid-plan__body">
					{ __(
						"The plan in this link isn't available here. You can choose a plan that works for you."
					) }
				</p>
				<div className="direct-to-cart-invalid-plan__cta">
					<Button variant="primary" href="/plans">
						{ __( 'Pick a plan' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default DirectToCartInvalidPlan;
