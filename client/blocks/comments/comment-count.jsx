/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const CommentCount = ( { count } ) => {
	const countPhrase = count + ' comments'; // needs translation and phrase logic
	return (
		<div className="comments__comment-count">
			{ countPhrase }
		</div>
	);
};

CommentCount.propTypes = {
	count: React.PropTypes.number.isRequired
};

export default CommentCount;
