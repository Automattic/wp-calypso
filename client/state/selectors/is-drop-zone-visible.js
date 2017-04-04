/**
 * External dependencies
 */
import get from 'lodash/get';

export default function isDropZoneVisible( state ) {
	return get( state, 'dropZone.isVisible', false );
}
