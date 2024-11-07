import { get } from 'lodash';
import { PickerSession } from 'calypso/data/media/use-google-photos-picker-session-mutation';
import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker session ID
 */
export default function getGooglePhotosPickerSession( state: AppState ): PickerSession | undefined {
	return get( state, [ 'media', 'googlePhotosPicker', 'session' ], undefined );
}
