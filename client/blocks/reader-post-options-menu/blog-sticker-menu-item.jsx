/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { addBlogSticker, removeBlogSticker } from 'calypso/state/sites/blog-stickers/actions';

class ReaderPostOptionsMenuBlogStickerMenuItem extends React.Component {
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
