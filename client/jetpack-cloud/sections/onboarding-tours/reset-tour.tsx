import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from './constants';

export default function ResetTour( tourName: string, tourSteps: string[] ) {
	const storageItemName = 'Jetpack_Manage_Preference_Reset_' + tourName;

	const dispatch = useDispatch();

	const resetPreference = window.localStorage.getItem( storageItemName );

	if ( resetPreference !== 'true' ) {
		return;
	}

	tourSteps.forEach( ( tour ) => {
		dispatch( savePreference( JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ tour ], null ) );
	} );
}
