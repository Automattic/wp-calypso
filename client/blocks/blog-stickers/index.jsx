/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import BlogStickersList from 'blocks/blog-stickers/list';
import QueryBlogStickers from 'components/data/query-blog-stickers';
import QueryReaderTeams from 'components/data/query-reader-teams';
import InfoPopover from 'components/info-popover';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import { getReaderTeams, getBlogStickers } from 'state/selectors';

const BlogStickers = ( { blogId, teams, stickers } ) => {
	const isTeamMember = isAutomatticTeamMember( teams );
	if ( teams && ! isTeamMember ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			{ isTeamMember &&
				stickers &&
				stickers.length > 0 &&
				<InfoPopover rootClassName="blog-stickers__popover">
					<BlogStickersList stickers={ stickers } />
				</InfoPopover> }
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
