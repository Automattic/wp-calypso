/**
 * External dependencies
 */
import React from 'react';

function FeedTitle( { feed: { name, URL, feed_URL } } ) {
	return <>{ name || URL || feed_URL }</>;
}

export default FeedTitle;
