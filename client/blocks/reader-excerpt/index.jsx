import PropTypes from 'prop-types';
import AutoDirection from 'calypso/components/auto-direction';

import './style.scss';

const ReaderExcerpt = ( { post, isDiscover } ) => {
	let excerpt = post.better_excerpt || post.excerpt;

	// Force post.excerpt for Discover only
	if ( isDiscover ) {
		excerpt = post.excerpt;
	}

	return (
		<AutoDirection>
			<div
				className="reader-excerpt__content reader-excerpt"
				dangerouslySetInnerHTML={ { __html: excerpt } } // eslint-disable-line react/no-danger
			/>
		</AutoDirection>
	);
};

ReaderExcerpt.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default ReaderExcerpt;
