/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PostLikes from '../';

function PostLikesExample() {
	return (
		<div>
			<PostLikes siteId={ 3584907 } postId={ 37769 } />
		</div>
	);
}

PostLikesExample.displayName = 'PostLikes';

export default PostLikesExample;
