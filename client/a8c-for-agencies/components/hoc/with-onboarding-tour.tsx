import { isEnabled } from '@automattic/calypso-config';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import OnboardingTourModal from '../onboarding-tour-modal';

export const ONBOARDING_TOUR_HASH = '#onboarding-tour';

function useOnboardingTour() {
	const [ isOpen, setIsOpen ] = useState( false );

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( isEnabled( 'a4a-unified-onboarding-tour' ) && hash === ONBOARDING_TOUR_HASH ) {
				setIsOpen( true );
			}
		};

		// Check hash on mount
		handleHashChange();

		// Listen for hash changes
		window.addEventListener( 'hashchange', handleHashChange );

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	const onClose = useCallback( () => {
		setIsOpen( false );
		// Remove the hash from the URL
		window.history.replaceState( '', '', window.location.pathname );
	}, [] );

	return {
		isOpen,
		onClose,
	};
}

export function withOnboardingTour< T extends JSX.IntrinsicAttributes >(
	WrappedComponent: ComponentType< T >
) {
	return function WithOnboardingTourWrapper( props: T ) {
		const { isOpen, onClose } = useOnboardingTour();

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal onClose={ onClose }>
						<OnboardingTourModal.Section id="1" title="Section 1">
							<p>Section 1</p>
						</OnboardingTourModal.Section>
						<OnboardingTourModal.Section id="1" title="Section 2">
							<p>Section 2</p>
						</OnboardingTourModal.Section>
					</OnboardingTourModal>
				) }
			</>
		);
	};
}
