import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { StepIndicator } from 'calypso/reader/components/step-indicator';

import './style.scss';

interface EarlyReadersModalProps {
	onDecline: () => void;
}

// Renders the body of the "early-readers" step — the Early Readers Program
// opt-in screen shown after discover for the treatment variation of the
// calypso_reader_early_readers_v0 experiment. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`) so transitions between
// steps don't unmount/remount the modal frame.
export const EarlyReadersModal = ( { onDecline }: EarlyReadersModalProps ) => {
	return (
		<>
			<VStack spacing={ 4 } className="early-readers-modal__content">
				<h2 className="early-readers-modal__title">{ __( 'Get your first readers' ) }</h2>
				<p className="early-readers-modal__subtitle">
					{ __(
						'We’ll put you in a group with four other people starting a blog this week, and you’ll read each other’s first posts.'
					) }
				</p>
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 4 } currentStep={ 4 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<Button __next40pxDefaultSize variant="tertiary" onClick={ onDecline }>
							{ __( 'No thanks' ) }
						</Button>
						<Button __next40pxDefaultSize variant="primary" disabled>
							{ __( 'Join Early Readers' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
};
