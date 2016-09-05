/**
 * External dependencies
 */
import React from 'react';

const ReaderFullPostActionLinks = ( { post } ) => {
	return (
		<ul className="reader-full-post__action-links">
			<li>edit { post.title }</li>
			<li>share</li>
			<li>x comments</li>
			<li>like</li>
		</ul>
	);
};

ReaderFullPostActionLinks.propTypes = {
	post: React.PropTypes.object.isRequired
};

export default ReaderFullPostActionLinks;
