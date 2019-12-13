/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import { connect } from 'react-redux';
import QueryReaderTeams from 'components/data/query-reader-teams';
import QueryBlogStickers from 'components/data/query-blog-stickers';
import getBlogStickers from 'state/selectors/get-blog-stickers';
import getReaderTeams from 'state/selectors/get-reader-teams';
import BlogStickersList from 'blocks/blog-stickers/list';
import InfoPopover from 'components/info-popover';
import { isAutomatticTeamMember } from 'reader/lib/teams';

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
