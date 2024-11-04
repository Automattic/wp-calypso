import { get } from 'lodash';
import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker session ID
 */
export default function getGooglePhotosPickerSession( state: AppState ): string | undefined {
	return get( state, [ 'media', 'googlePhotosPicker', 'session' ], undefined );
}
