import { isEnabled } from '@automattic/calypso-config';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import OnboardingTourModal from '../../onboarding-tour-modal';
import useOnboardingTourSections from './hooks/use-onboarding-tour-sections';

import './style.scss';

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

		const sections = useOnboardingTourSections();

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal onClose={ onClose }>
						{ sections.map( ( section ) => (
							<OnboardingTourModal.Section
								key={ section.id }
								id={ section.id }
								title={ section.title }
								bannerImage={ section.bannerImage }
								renderActions={ section.renderActions }
							>
								{ section.content }
							</OnboardingTourModal.Section>
						) ) }
					</OnboardingTourModal>
				) }
			</>
		);
	};
}
