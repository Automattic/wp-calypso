import { get } from 'lodash';
import { PickerSession } from 'calypso/data/media/use-google-photos-picker-session-mutation';
import { retrieveGooglePhotosPickerSessionCookie } from 'calypso/jetpack-connect/persistence-utils';
import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker session ID
 */
export default function getGooglePhotosPickerSession( state: AppState ): PickerSession | undefined {
	const session = retrieveGooglePhotosPickerSessionCookie();

	return session || get( state, [ 'media', 'googlePhotosPicker', 'session' ], undefined );
}
