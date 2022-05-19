import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import BlogStickersList from 'calypso/blocks/blog-stickers/list';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import InfoPopover from 'calypso/components/info-popover';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { errorNotice } from 'calypso/state/notices/actions';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { useBlogStickersQuery } from './use-blog-stickers-query';

import './style.scss';

const BlogStickers = ( { blogId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const teams = useSelector( getReaderTeams );
	const isTeamMember = isAutomatticTeamMember( teams );

	const { data: stickers } = useBlogStickersQuery( blogId, {
		onError() {
			dispatch(
				errorNotice(
					translate( 'Sorry, we had a problem retrieving blog stickers. Please try again.' )
				)
			);
		},
	} );

	if ( teams && ! isTeamMember ) {
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
