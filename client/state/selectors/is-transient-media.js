/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getMediaItem from 'calypso/state/selectors/get-media-item';

export default function isTransientMedia( state, siteId, mediaId ) {
	return !! get( getMediaItem( state, siteId, mediaId ), 'transient' );
}
