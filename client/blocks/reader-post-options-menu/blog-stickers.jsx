/** @format */
/**
 * External dependencies
 */
import { map, includes } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderPostOptionsMenuBlogStickerMenuItem from './blog-sticker-menu-item';
import QueryBlogStickers from 'components/data/query-blog-stickers';
import { getBlogStickers } from 'state/selectors';

class ReaderPostOptionsMenuBlogStickers extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
	};

	render() {
		const blogStickersOffered = [ 'dont-recommend', 'broken-in-reader' ];
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
