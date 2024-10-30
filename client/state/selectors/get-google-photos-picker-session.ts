import { get } from 'lodash';
import { SessionData } from 'calypso/data/media/use-google-photos-picker-session-query';
import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker session ID
 */
export default function getGooglePhotosPickerSession( state: AppState ): SessionData | undefined {
	return get( state, [ 'media', 'googlePhotosPicker', 'session' ], undefined );
}
