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
import getBlogStickers from 'state/selectors/get-blog-stickers';
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
				<QueryBlogStickers blogId={ blogId } />
				{ map( blogStickersOffered, ( blogStickerName ) => (
					<ReaderPostOptionsMenuBlogStickerMenuItem
						key={ blogStickerName }
						blogId={ blogId }
						blogStickerName={ blogStickerName }
						hasSticker={ includes( stickers, blogStickerName ) }
					>
						{ blogStickerName }
					</ReaderPostOptionsMenuBlogStickerMenuItem>
				) ) }
			</div>
		);
	}
}

export default connect( ( state, { blogId } ) => ( {
	stickers: getBlogStickers( state, blogId ),
} ) )( ReaderPostOptionsMenuBlogStickers );
