/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { map, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getBlogStickers } from 'state/selectors';
import QueryBlogStickers from 'components/data/query-blog-stickers';
import ReaderPostOptionsMenuBlogStickerMenuItem from './blog-sticker-menu-item';

class ReaderPostOptionsMenuBlogStickers extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
	};

	render() {
		const blogStickersOffered = [ 'dont-recommend', 'broken-in-reader', 'a8c-test-blog' ];
		const { blogId, stickers } = this.props;

		return (
			<div className="reader-post-options-menu__blog-stickers">
				{ map( blogStickersOffered, blogStickerName => (
					<ReaderPostOptionsMenuBlogStickerMenuItem
						key={ blogStickerName }
						blogId={ blogId }
						blogStickerName={ blogStickerName }
						hasSticker={ includes( stickers, blogStickerName ) }
					>
						{ blogStickerName }
					</ReaderPostOptionsMenuBlogStickerMenuItem>
				) ) }
				{ ! stickers && <QueryBlogStickers blogId={ blogId } /> }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		stickers: ownProps.blogId ? getBlogStickers( state, ownProps.blogId ) : undefined,
	};
} )( ReaderPostOptionsMenuBlogStickers );
