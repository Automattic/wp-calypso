/**
 * Internal Dependencies
 */
import {
	READER_VIEWING_FULL_POST_SET,
	READER_VIEWING_FULL_POST_UNSET,
} from 'calypso/state/reader/action-types';

export const setViewingFullPostKey = ( postKey ) => ( {
	type: READER_VIEWING_FULL_POST_SET,
	postKey,
} );

export const unsetViewingFullPostKey = ( postKey ) => ( {
	type: READER_VIEWING_FULL_POST_UNSET,
	postKey,
} );
