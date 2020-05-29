const PIXEL_VERSION = 'seen_posts';
const ACTION_MARK_AS_SEEN = 'x_mark_as_seen';
const ACTION_MARK_AS_UNSEEN = 'x_mark_as_unseen';
const ACTION_MARK_ALL_AS_SEEN = 'x_mark_all_as_seen';

/**
 * Load tracking pixel image
 *
 */
const loadTrackingPixel = ( { action, userId, feedId, feedIds, feedItemIds } ) => {
	const protocol = document.location.protocol;
	let src = `${ protocol }//pixel.wp.com/g.gif?v=${ PIXEL_VERSION }`;

	if ( ! action || ! userId ) {
		return;
	}
	src += `&x_action=${ action }&user_id=${ userId }`;

	if ( feedId ) {
		const xFeedId = encodeURIComponent( feedId );
		src += `&x_feed_id=${ xFeedId }`;
	}

	if ( feedIds ) {
		const xFeedIds = encodeURIComponent( feedIds.join( ',' ) );
		src += `&x_feed_ids=${ xFeedIds }`;
	}

	if ( feedItemIds ) {
		const xFeedItemIds = encodeURIComponent( feedItemIds.join( ',' ) );
		src += `&x_feed_item_ids=${ xFeedItemIds }`;
	}

	new window.Image().src = src + `&rand=${ Math.random() }&orangutan=1`;
};

export const persistMarkAsSeen = ( { userId, feedId, feedItemIds } ) => {
	loadTrackingPixel( {
		action: ACTION_MARK_AS_SEEN,
		userId,
		feedId,
		feedItemIds,
	} );
};

export const persistMarkAsUnseen = ( { userId, feedId, feedItemIds } ) => {
	loadTrackingPixel( {
		action: ACTION_MARK_AS_UNSEEN,
		userId,
		feedId,
		feedItemIds,
	} );
};

export const persistMarkAllAsSeen = ( { userId, feedIds } ) => {
	loadTrackingPixel( {
		action: ACTION_MARK_ALL_AS_SEEN,
		userId,
		feedIds,
	} );
};
