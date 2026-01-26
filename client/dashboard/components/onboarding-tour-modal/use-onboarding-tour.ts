import { useCallback, useEffect, useState } from 'react';
import { ONBOARDING_TOUR_HASH } from './types';

interface UseOnboardingTourOptions {
	/**
	 * Optional condition to check before opening the tour.
	 * If provided, the tour will only open when the hash matches AND this condition is true.
	 */
	isEnabled?: boolean;
}

export default function useOnboardingTour( options: UseOnboardingTourOptions = {} ) {
	const { isEnabled = true } = options;
	const [ isOpen, setIsOpen ] = useState( false );

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( isEnabled && hash.startsWith( ONBOARDING_TOUR_HASH ) ) {
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
	}, [ isEnabled ] );

	const onClose = useCallback( () => {
		setIsOpen( false );
		// Remove the hash from the URL
		window.history.replaceState( '', '', window.location.pathname );
	}, [] );

	const onOpen = useCallback( () => {
		setIsOpen( true );
		window.history.replaceState( '', '', ONBOARDING_TOUR_HASH );
	}, [] );

	return {
		isOpen,
		onClose,
		onOpen,
	};
}
