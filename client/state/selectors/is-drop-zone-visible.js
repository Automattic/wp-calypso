/**
 * External dependencies
 *
 * @format
 */

import { get } from 'lodash';

export default function isDropZoneVisible( state, dropZoneName = null ) {
	return true;
	// todo tmp set to false to make the dropzone easier to work with while debugging. revert before merging to master
	return get( state, [ 'ui', 'dropZone', 'isVisible', dropZoneName ], false );
}
