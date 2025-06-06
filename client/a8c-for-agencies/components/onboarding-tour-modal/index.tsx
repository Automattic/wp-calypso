import { Modal } from '@wordpress/components';
import { Children, isValidElement, ReactNode } from 'react';
import OnboardingTourModalSection from './section';

interface OnboardingTourModalProps {
	onClose: () => void;
	children?: React.ReactNode;
}

function OnboardingTourModal( { onClose, children }: OnboardingTourModalProps ) {
	const sections = Children.toArray( children ).filter(
		( child: ReactNode ) => isValidElement( child ) && child.type === OnboardingTourModalSection
	);

	return (
		<Modal className="onboarding-tour-modal" onRequestClose={ onClose } __experimentalHideHeader>
			<div className="onboarding-tour-modal__main">{ sections }</div>
		</Modal>
	);
}

OnboardingTourModal.Section = OnboardingTourModalSection;

export default OnboardingTourModal;
