/**
 * External dependencies
 */
import get from 'lodash/get';

export default function isDropZoneVisible( state, dropZoneName = null ) {
	return get( state, [ 'ui', 'dropZone', 'isVisible', dropZoneName ], false );
}
