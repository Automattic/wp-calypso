import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import BlogStickersList from 'calypso/blocks/blog-stickers/list';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import InfoPopover from 'calypso/components/info-popover';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { useBlogStickersQuery } from './use-blog-stickers-query';

import './style.scss';

const BlogStickers = ( { blogId } ) => {
	const teams = useSelector( getReaderTeams );
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
			{ ! teams && <QueryReaderTeams /> }
		</div>
	);
};

BlogStickers.propTypes = {
	blogId: PropTypes.number.isRequired,
};

export default BlogStickers;
