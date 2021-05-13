/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import DisplayTypes from 'calypso/state/reader/posts/display-types';
import ReaderPostCard from 'calypso/blocks/reader-post-card';

export class ReaderPreview extends PureComponent {
	render() {
		const { site, post, postExcerpt, postImage } = this.props;

		// Add some ReaderPost specific properties that are necessary
		const readerPost = Object.assign(
			{},
			post,
			{ better_excerpt: postExcerpt },
			postImage && { canonical_media: { src: postImage } },
			postImage && ! postExcerpt && { display_type: DisplayTypes.PHOTO_ONLY },
			{
				author: Object.assign( {}, post.author, { has_avatar: true } ),
			}
		);

		return <ReaderPostCard site={ site } post={ readerPost } />;
	}
}

ReaderPreview.propTypes = {
	site: PropTypes.object,
	post: PropTypes.object,
	postExcerpt: PropTypes.string,
	postImage: PropTypes.string,
};

export default ReaderPreview;
