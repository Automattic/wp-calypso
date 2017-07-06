/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { addBlogSticker } from 'state/sites/blog-stickers/actions';

class ReaderPostOptionsMenuBlogStickerMenuItem extends React.Component {
	static propTypes = {
		blogId: React.PropTypes.number,
		blogStickerName: React.PropTypes.string,
		hasSticker: React.PropTypes.bool,
	};

	addSticker = () => {
		if ( this.props.hasSticker ) {
			return null;
		}

		this.props.addBlogSticker( this.props.blogId, this.props.blogStickerName );
	};

	render() {
		const { hasSticker, blogStickerName, children } = this.props;
		const classes = classnames( 'reader-post-options-menu__blog-sticker-menu-item', {
			'has-sticker': hasSticker,
		} );

		return (
			<PopoverMenuItem
				icon="tag"
				key={ blogStickerName }
				className={ classes }
				onClick={ this.addSticker }
			>
				{ children }
			</PopoverMenuItem>
		);
	}
}

export default connect( null, { addBlogSticker } )( ReaderPostOptionsMenuBlogStickerMenuItem );
