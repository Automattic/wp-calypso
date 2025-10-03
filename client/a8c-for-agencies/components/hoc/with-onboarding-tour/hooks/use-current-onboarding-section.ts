import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const UNIFIED_ONBOARDING_TOUR_CURRENT_SECTION_PREFERENCE = 'a4a-onboarding-tours-current-section';

export default function useCurrentOnboardingSection() {
	const dispatch = useDispatch();
	const currentSection = useSelector( ( state ) =>
		getPreference( state, UNIFIED_ONBOARDING_TOUR_CURRENT_SECTION_PREFERENCE )
	);

	const saveCurrentSection = useCallback(
		( sectionId: string ) => {
			dispatch( savePreference( UNIFIED_ONBOARDING_TOUR_CURRENT_SECTION_PREFERENCE, sectionId ) );
		},
		[ dispatch ]
	);

	const removeCurrentSection = useCallback( () => {
		dispatch( savePreference( UNIFIED_ONBOARDING_TOUR_CURRENT_SECTION_PREFERENCE, null ) );
	}, [ dispatch ] );

	return {
		currentSection,
		saveCurrentSection,
		removeCurrentSection,
	};
}
