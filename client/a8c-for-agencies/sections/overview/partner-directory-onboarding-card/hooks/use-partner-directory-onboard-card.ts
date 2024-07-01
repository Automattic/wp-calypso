import { useCallback } from 'react';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const PARTNER_DIRECTORY_ONBOARDING_CARD_PREFERENCE_NAME = 'a4a-partner-directory-onboarding-card';

export function usePartnerDirectoryOnboardingCard() {
	const dispatch = useDispatch();

	const hasPreference = useSelector( ( state ) =>
		getPreference( state, PARTNER_DIRECTORY_ONBOARDING_CARD_PREFERENCE_NAME )
	);

	const hideCard = useCallback( () => {
		dispatch( savePreference( PARTNER_DIRECTORY_ONBOARDING_CARD_PREFERENCE_NAME, true ) );
	}, [ dispatch ] );

	return {
		isActive: ! hasPreference && isSectionNameEnabled( 'a8c-for-agencies-partner-directory' ),
		hideCard,
	};
}
