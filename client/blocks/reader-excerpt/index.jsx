/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

const ReaderExcerpt = ( { post, isDiscover } ) => {
	let excerpt = post.better_excerpt || post.excerpt;

	// Force post.excerpt for Discover only
	if ( isDiscover ) {
		excerpt = post.excerpt;
	}

	return (
		<AutoDirection>
			<Emojify>
				<div
					className="reader-excerpt__content reader-excerpt"
					dangerouslySetInnerHTML={ { __html: excerpt } } // eslint-disable-line react/no-danger
				/>
			</Emojify>
		</AutoDirection>
	);
};

ReaderExcerpt.propTypes = {
	post: React.PropTypes.object.isRequired,
	isDiscover: React.PropTypes.bool,
};

export default ReaderExcerpt;
