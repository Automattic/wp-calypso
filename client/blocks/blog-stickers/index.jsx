/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import { connect } from 'react-redux';
import QueryReaderTeams from 'client/components/data/query-reader-teams';
import QueryBlogStickers from 'client/components/data/query-blog-stickers';
import { getReaderTeams, getBlogStickers } from 'client/state/selectors';
import BlogStickersList from 'client/blocks/blog-stickers/list';
import InfoPopover from 'client/components/info-popover';
import { isAutomatticTeamMember } from 'client/reader/lib/teams';

const BlogStickers = ( { blogId, teams, stickers } ) => {
	const isTeamMember = isAutomatticTeamMember( teams );
	if ( teams && ! isTeamMember ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			{ isTeamMember &&
				stickers &&
				stickers.length > 0 && (
					<InfoPopover rootClassName="blog-stickers__popover">
						<BlogStickersList stickers={ stickers } />
					</InfoPopover>
				) }
			{ ! stickers && <QueryBlogStickers blogId={ blogId } /> }
			{ ! teams && <QueryReaderTeams /> }
		</div>
	);
};

BlogStickers.propTypes = {
	blogId: PropTypes.number.isRequired,
};

export default connect( ( state, ownProps ) => {
	return {
		teams: getReaderTeams( state ),
		stickers: getBlogStickers( state, ownProps.blogId ),
	};
} )( BlogStickers );
