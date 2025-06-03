import { notAllowed } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { useRemoveBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-remove-blog-sticker-mutation';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { errorNotice, plainNotice, successNotice } from 'calypso/state/notices/actions';

function ReaderPostOptionsMenuBlogStickerMenuItem( {
	blogId,
	blogStickerName,
	hasSticker,
	children,
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { addBlogSticker } = useAddBlogStickerMutation( {
		onError() {
			dispatch(
				errorNotice( translate( 'Sorry, we had a problem adding that sticker. Please try again.' ) )
			);
		},
		onSuccess( data, { stickerName } ) {
			dispatch(
				successNotice(
					translate( 'The sticker {{i}}%s{{/i}} has been successfully added.', {
						args: stickerName,
						components: {
							i: <i />,
						},
					} ),
					{
						duration: 5000,
					}
				)
			);
		},
	} );

	const { removeBlogSticker } = useRemoveBlogStickerMutation( {
		onError() {
			dispatch(
				errorNotice(
					translate( 'Sorry, we had a problem removing that sticker. Please try again.' )
				)
			);
		},
		onSuccess( data, { stickerName } ) {
			dispatch(
				plainNotice(
					translate( 'The sticker {{i}}%s{{/i}} has been removed.', {
						args: stickerName,
						components: {
							i: <i />,
						},
					} ),
					{
						duration: 5000,
					}
				)
			);
		},
	} );

	const toggleSticker = () => {
		const toggle = hasSticker ? removeBlogSticker : addBlogSticker;
		toggle( blogId, blogStickerName );
	};

	const classes = clsx( 'reader-post-options-menu__blog-sticker-menu-item', {
		'has-sticker': hasSticker,
	} );

	return (
		<PopoverMenuItem
			icon={ notAllowed }
			useWordPressIcon
			iconSize={ 24 }
			key={ blogStickerName }
			className={ classes }
			onClick={ toggleSticker }
		>
			{ children }
		</PopoverMenuItem>
	);
}

ReaderPostOptionsMenuBlogStickerMenuItem.propTypes = {
	blogId: PropTypes.number,
	blogStickerName: PropTypes.string,
	hasSticker: PropTypes.bool,
};

export default ReaderPostOptionsMenuBlogStickerMenuItem;
