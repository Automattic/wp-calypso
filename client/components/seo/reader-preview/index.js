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

		const readerPost = { ...post };
		if ( postImage ) {
			readerPost.canonical_media = { src: postImage };
		}
		readerPost.better_excerpt = postExcerpt;

		if ( postImage && ! postExcerpt ) {
			readerPost.display_type = DisplayTypes.PHOTO_ONLY;
		}

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
