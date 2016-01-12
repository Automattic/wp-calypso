/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

function PostsTypeaheadResult( { title, type, onClick } ) {
	return (
		<div onClick={ onClick } className="posts-typeahead__result">
			<div className="posts-typeahead__result-title">
				{ title }
			</div>
			<span className="posts-typeahead__result-type">
				{ type }
			</span>
		</div>
	);
}

PostsTypeaheadResult.propTypes = {
	title: PropTypes.string,
	type: PropTypes.string,
	onClick: PropTypes.string
};

export default PostsTypeaheadResult;
