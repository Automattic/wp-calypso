import { get } from 'lodash';
import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker feature status
 */
export default function getGooglePhotosPickerFeatureStatus( state: AppState ): boolean | null {
	return get( state, [ 'media', 'googlePhotosPicker', 'featureEnabled' ], null );
}
