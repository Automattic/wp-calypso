import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreferenceKey } from './utils';

export const dismissCard = ( preferenceName, temporary ) =>
	( temporary ? setPreference : savePreference )( getPreferenceKey( preferenceName ), true );
