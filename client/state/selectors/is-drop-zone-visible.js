/**
 * External dependencies
 */
import { get } from 'lodash';

import 'state/drop-zone/init';

export default function isDropZoneVisible( state, dropZoneName = null ) {
	return get( state, [ 'dropZone', 'isVisible', dropZoneName ], false );
}
