/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import { connect } from 'react-redux';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import QueryBlogStickers from 'calypso/components/data/query-blog-stickers';
import getBlogStickers from 'calypso/state/selectors/get-blog-stickers';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import BlogStickersList from 'calypso/blocks/blog-stickers/list';
import InfoPopover from 'calypso/components/info-popover';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';

/**
 * Style dependencies
 */
import './style.scss';

const BlogStickers = ( { blogId, teams, stickers } ) => {
	const isTeamMember = isAutomatticTeamMember( teams );
	if ( teams && ! isTeamMember ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			<QueryBlogStickers blogId={ blogId } />
			{ isTeamMember && stickers && stickers.length > 0 && (
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

export default connect( ( state, { blogId } ) => ( {
	teams: getReaderTeams( state ),
	stickers: getBlogStickers( state, blogId ),
} ) )( BlogStickers );
