/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';

const ReaderExcerpt = ( { post, isDiscover } ) => {
	let excerpt = post.better_excerpt || post.excerpt;

	// Force post.excerpt for Discover only
	if ( isDiscover ) {
		excerpt = post.excerpt;
	}

	return (
		<AutoDirection>
			<div className="reader-excerpt"
				dangerouslySetInnerHTML={ { __html: excerpt } } // eslint-disable-line react/no-danger
			/>
		</AutoDirection>
	);
};

ReaderExcerpt.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default ReaderExcerpt;
