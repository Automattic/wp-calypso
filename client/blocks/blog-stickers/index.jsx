import { readerTeamsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import BlogStickersList from 'calypso/blocks/blog-stickers/list';
import InfoPopover from 'calypso/components/info-popover';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { useBlogStickersQuery } from './use-blog-stickers-query';

import './style.scss';

const BlogStickers = ( { blogId } ) => {
	const { data } = useQuery( readerTeamsQuery() );
	const teams = data?.teams ?? [];
	const isTeamMember = isAutomatticTeamMember( teams );

	const { data: stickers } = useBlogStickersQuery( blogId );

	if ( teams.length && ! isTeamMember ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			{ isTeamMember && stickers?.length > 0 && (
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
