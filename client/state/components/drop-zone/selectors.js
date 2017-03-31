/**
 * External dependencies
 */
import get from 'lodash/get';

export function isDropZoneVisible( state ) {
	return get( state, 'dropZone.isVisible', false );
}
