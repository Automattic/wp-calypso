/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GroupedPosts from './grouped-posts';
import SinglePost from './single-post';

const PostsList = ( { postsByYear, summary, period } ) => {
	const allPosts = Array.prototype.concat( ...postsByYear );
	return ! summary && allPosts.length === 1
		? <SinglePost post={ allPosts[ 0 ] } summary={ summary } period={ period } />
		: <GroupedPosts postsByYear={ postsByYear } summary={ summary } period={ period } />;
};

export default PostsList;
