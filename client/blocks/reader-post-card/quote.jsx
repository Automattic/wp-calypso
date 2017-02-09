/**
 * External Dependencies
 */
import React from 'react';

/**
 * Interal Dependencies
 */
import ReaderPostCardExcerpt from './excerpt';

const QuotePost = ( { post, children } ) => {
	return (
		<div className="reader-post-card__post" >
			<div className="reader-post-card__post-details">
				<ReaderPostCardExcerpt post={ post } isDiscover={ post.is_discover } />
				{ children }
			</div>
		</div> );
};

export default QuotePost;
