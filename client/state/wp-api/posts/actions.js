import {
	REQUIRE_POST
} from 'state/action-types';

export const requirePost = ( siteId, postId ) => ( {
	type: REQUIRE_POST,
	siteId,
	postId
} );
