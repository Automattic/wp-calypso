import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreferenceKey } from './utils';

export const dismissBlock = ( preferenceName, temporary ) => {
	const prefKey = getPreferenceKey( preferenceName );

	if ( temporary ) {
		return setPreference( prefKey, true );
	}

	return savePreference( prefKey, true );
};
