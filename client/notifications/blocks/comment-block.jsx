import React from 'react';

export const CommentBlock = ( { children, CommentId, siteId } ) =>
	<span className="note-range__comment">{ children }</span>;

export default CommentBlock;
