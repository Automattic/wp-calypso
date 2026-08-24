import { AppState } from 'calypso/types';

/**
 * Get the Google Photos Picker feature status
 */
export default function getGooglePhotosPickerFeatureStatus( state: AppState ): boolean | null {
	return state?.media?.googlePhotosPicker?.featureEnabled ?? null;
}
