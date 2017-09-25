/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ReaderPostCard from 'blocks/reader-post-card';
import DisplayTypes from 'state/reader/posts/display-types';

export class ReaderPreview extends PureComponent {
	render() {
		const {
			site,
			post,
			postExcerpt,
			postImage,
		} = this.props;

		// Add some ReaderPost specific properties that are necessary
		const readerPost = Object.assign(
			{},
			post,
			{ better_excerpt: postExcerpt },
			postImage && { canonical_media: { src: postImage } },
			( postImage && ! postExcerpt ) && { display_type: DisplayTypes.PHOTO_ONLY },
			{ author: Object.assign(
				{},
				post.author,
				{ has_avatar: true }
			) }
		);

		return (
			<ReaderPostCard site={ site } post={ readerPost } />
		);
	}
}

ReaderPreview.propTypes = {
	site: PropTypes.object,
	post: PropTypes.object,
	postExcerpt: PropTypes.string,
	postImage: PropTypes.string
};

export default ReaderPreview;
