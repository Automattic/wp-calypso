import PropTypes from 'prop-types';
import BlogStickersList from 'calypso/blocks/blog-stickers/list';
import InfoPopover from 'calypso/components/info-popover';
import { useBlogStickersQuery } from './use-blog-stickers-query';

import './style.scss';

const BlogStickers = ( { blogId } ) => {
	const { data: stickers, teams, isAutomattician } = useBlogStickersQuery( blogId );

	if ( teams.length && ! isAutomattician ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			{ isAutomattician && stickers?.length > 0 && (
				<InfoPopover>
					<BlogStickersList stickers={ stickers } />
				</InfoPopover>
			) }
		</div>
	);
};

BlogStickers.propTypes = {
	blogId: PropTypes.number.isRequired,
};

export default BlogStickers;
