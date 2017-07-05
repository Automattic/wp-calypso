/**
 * External dependencies
 */
import React from 'react';
import { map } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { getBlogStickers } from 'state/selectors';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';

class ReaderPostOptionsMenuBlogStickers extends React.Component {
	static propTypes = {
		siteId: React.PropTypes.number.isRequired,
	};

	addSticker = stickerName => {
		this.props.addBlogSticker( this.props.siteId, stickerName );
	};

	render() {
		const blogStickersOffered = [ 'dont-recommend', 'broken-in-reader' ];

		// @todo
		// - query blog stickers
		// - highlighted state for stickers already set
		// - onclick event for setting blog sticker
		return (
			<div className="reader-post-options-menu__blog-stickers">
				{ map( blogStickersOffered, blogStickerName => (
					<PopoverMenuItem
						icon="tag"
						key={ blogStickerName }
						className="reader-post-options-menu__blog-stickers-item"
						onClick={ this.addSticker( blogStickerName ) }
					>
						{ blogStickerName }
					</PopoverMenuItem>
				) ) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			stickers: ownProps.siteId && ownProps.siteId > 0
				? getBlogStickers( state, ownProps.blogId )
				: undefined,
		};
	},
	{ addBlogSticker }
)( ReaderPostOptionsMenuBlogStickers );
