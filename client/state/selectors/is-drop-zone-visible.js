/**
 * External dependencies
 */
import get from 'lodash/get';

export default function isDropZoneVisible( state ) {
	return get( state, 'ui.dropZone.isVisible', false );
}
