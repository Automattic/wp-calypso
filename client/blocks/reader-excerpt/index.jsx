/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'calypso/components/auto-direction';
import Emojify from 'calypso/components/emojify';

/**
 * Style dependencies
 */
import './style.scss';

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
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default ReaderExcerpt;
