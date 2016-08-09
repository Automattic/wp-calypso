import React from 'react';

export const CommentBlock = ( { children, CommentId, siteId } ) =>
	<span className="text-range comment">{ children }</span>;

export default CommentBlock;
