/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isDropZoneVisible( state, dropZoneName = null ) {
	return get( state, [ 'ui', 'dropZone', 'isVisible', dropZoneName ], false );
}
