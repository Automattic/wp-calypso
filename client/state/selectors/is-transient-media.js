/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getMediaItem } from 'client/state/selectors';

export default function isTransientMedia( state, siteId, mediaId ) {
	return !! get( getMediaItem( state, siteId, mediaId ), 'transient' );
}
