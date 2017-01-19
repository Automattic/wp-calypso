/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';

const ReaderPostCardExcerpt = ( { post, isDiscover } )=> {
	let excerpt = post.better_excerpt || post.excerpt;

	// Force post.excerpt for Discover only
	if ( isDiscover ) {
		excerpt = post.excerpt;
	}

	return (
		<AutoDirection>
			<div className="reader-post-card__excerpt"
				dangerouslySetInnerHTML={ { __html: excerpt } } // eslint-disable-line react/no-danger
			/>
		</AutoDirection>
	);
};

ReaderPostCardExcerpt.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default ReaderPostCardExcerpt;
