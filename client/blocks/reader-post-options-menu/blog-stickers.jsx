import PropTypes from 'prop-types';
import { useBlogStickersQuery } from 'calypso/blocks/blog-stickers/use-blog-stickers-query';
import ReaderPostOptionsMenuBlogStickerMenuItem from './blog-sticker-menu-item';

const blogStickersOffered = [ 'dont-recommend', 'broken-in-reader', 'a8c-test-blog' ];

function ReaderPostOptionsMenuBlogStickers( { blogId } ) {
	const { data: stickers = [] } = useBlogStickersQuery( blogId );

	return (
		<div className="reader-post-options-menu__blog-stickers">
			{ blogStickersOffered.map( ( blogStickerName ) => (
				<ReaderPostOptionsMenuBlogStickerMenuItem
					key={ blogStickerName }
					blogId={ blogId }
					blogStickerName={ blogStickerName }
					hasSticker={ stickers.includes( blogStickerName ) }
				>
					{ blogStickerName }
				</ReaderPostOptionsMenuBlogStickerMenuItem>
			) ) }
		</div>
	);
}

ReaderPostOptionsMenuBlogStickers.propTypes = {
	blogId: PropTypes.number.isRequired,
};

export default ReaderPostOptionsMenuBlogStickers;
