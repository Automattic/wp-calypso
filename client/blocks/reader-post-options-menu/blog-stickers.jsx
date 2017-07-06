/**
 * External dependencies
 */
import React from 'react';
import { map, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { getBlogStickers } from 'state/selectors';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';
import QueryBlogStickers from 'components/data/query-blog-stickers';

class ReaderPostOptionsMenuBlogStickers extends React.Component {
	static propTypes = {
		blogId: React.PropTypes.number.isRequired,
	};

	addSticker = stickerName => {
		this.props.addBlogSticker( this.props.blogId, stickerName );
	};

	render() {
		const blogStickersOffered = [ 'dont-recommend', 'broken-in-reader' ];
		const { blogId, stickers } = this.props;

		return (
			<div className="reader-post-options-menu__blog-stickers">
				{ map(
					blogStickersOffered,
					blogStickerName =>
						( includes( blogStickerName, stickers )
							? <PopoverMenuItem
									icon="tag"
									key={ blogStickerName }
									className="reader-post-options-menu__blog-stickers-item has-sticker"
								>
									{ blogStickerName }
								</PopoverMenuItem>
							: <PopoverMenuItem
									icon="tag"
									key={ blogStickerName }
									className="reader-post-options-menu__blog-stickers-item"
									onClick={ this.addSticker( blogStickerName ) }
								>
									{ blogStickerName }
								</PopoverMenuItem> )
				) }
				{ ! stickers && <QueryBlogStickers blogId={ blogId } /> }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			stickers: ownProps.blogId && ownProps.blogId > 0
				? getBlogStickers( state, ownProps.blogId )
				: undefined,
		};
	},
	{ addBlogSticker }
)( ReaderPostOptionsMenuBlogStickers );
