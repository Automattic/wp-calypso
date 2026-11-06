import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { WooPaymentsLandingIntro, WooPaymentsLandingStory } from '.';

export default function WooPaymentsLearnMoreModal( { onClose }: { onClose: () => void } ) {
	const title = __( 'About WooPayments commissions' );
	return (
		<Modal
			contentLabel={ title }
			size="large"
			className="dashboard-woopayments-learn-more-modal"
			onRequestClose={ onClose }
		>
			<div
				className="dashboard-woopayments-landing"
				data-context="learn-more"
				aria-labelledby="woopayments-landing-title"
			>
				<WooPaymentsLandingIntro heroTitle={ title } />
				<WooPaymentsLandingStory />
			</div>
		</Modal>
	);
}
