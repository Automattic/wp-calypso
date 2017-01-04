import React from 'react';

export const PostBlock = ( { children, postId, siteId } ) =>
	<span className="note-range__post">{ children }</span>;

export default PostBlock;
