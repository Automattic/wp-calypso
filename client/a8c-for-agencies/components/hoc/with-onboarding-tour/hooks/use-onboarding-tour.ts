import { isEnabled } from '@automattic/calypso-config';
import { useCallback, useEffect, useState } from 'react';
import { A4A_ONBOARDING_TOUR_COMPLETED_PREFERENCE_NAME } from 'calypso/a8c-for-agencies/sections/onboarding-tours/constants';
import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';

export const ONBOARDING_TOUR_HASH = '#onboarding-tour';

export default function useOnboardingTour() {
	const dispatch = useDispatch();
	const [ isOpen, setIsOpen ] = useState( false );

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( isEnabled( 'a4a-unified-onboarding-tour' ) && hash.startsWith( ONBOARDING_TOUR_HASH ) ) {
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
		dispatch( savePreference( A4A_ONBOARDING_TOUR_COMPLETED_PREFERENCE_NAME, true ) );
	}, [ dispatch ] );

	return {
		isOpen,
		onClose,
	};
}
