/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';

/**
 * Internal dependencies
 */
import DisplayTypes from 'state/reader/posts/display-types';
import ReaderPostCard from 'blocks/reader-post-card';

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
			post,
			{ better_excerpt: postExcerpt },
			postImage && { canonical_media: { src: postImage } },
			( postImage && ! postExcerpt ) && { display_type: DisplayTypes.PHOTO_ONLY },
			{ author: Object.assign(
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
	siteTitle: PropTypes.string,
	siteSlug: PropTypes.string,
	siteIcon: PropTypes.string,
	postTitle: PropTypes.string,
	postExcerpt: PropTypes.string,
	postImage: PropTypes.string,
	postDate: PropTypes.string,
	authorName: PropTypes.string,
	authorIcon: PropTypes.string
};

export default ReaderPreview;
