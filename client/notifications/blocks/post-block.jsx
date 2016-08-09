import React from 'react';

export const PostBlock = ( { children, postId, siteId } ) =>
	<span className="text-range post">{ children }</span>;

export default PostBlock;
