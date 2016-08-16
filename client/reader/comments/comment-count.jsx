/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const CommentCount = ( { count } ) => {
	const countPhrase = '33 giraffes';
	return (
		<div className="reader-comment-count">
			{ countPhrase }
		</div>
	);
};

CommentCount.propTypes = {
	count: React.PropTypes.number.isRequired
};

export default CommentCount;
