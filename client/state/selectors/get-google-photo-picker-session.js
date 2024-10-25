import { get } from 'lodash';

export default function getGooglePhotoPickerSession( state ) {
	return get( state, [ 'media', 'googlePhotosPicker', 'session' ], undefined );
}
