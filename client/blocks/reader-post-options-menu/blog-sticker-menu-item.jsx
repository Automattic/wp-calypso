import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { addBlogSticker, removeBlogSticker } from 'calypso/state/sites/blog-stickers/actions';

class ReaderPostOptionsMenuBlogStickerMenuItem extends Component {
	static propTypes = {
		blogId: PropTypes.number,
		blogStickerName: PropTypes.string,
		hasSticker: PropTypes.bool,
	};

	toggleSticker = () => {
		const toggle = this.props.hasSticker ? this.props.removeBlogSticker : this.props.addBlogSticker;
		toggle( this.props.blogId, this.props.blogStickerName );
	};

	render() {
		const { hasSticker, blogStickerName, children } = this.props;
		const classes = classnames( 'reader-post-options-menu__blog-sticker-menu-item', {
			'has-sticker': hasSticker,
		} );

		return (
			<PopoverMenuItem
				icon="flag"
				key={ blogStickerName }
				className={ classes }
				onClick={ this.toggleSticker }
			>
				{ children }
			</PopoverMenuItem>
		);
	}
}

export default connect( null, { addBlogSticker, removeBlogSticker } )(
	ReaderPostOptionsMenuBlogStickerMenuItem
);
