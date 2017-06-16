/**
 * External Dependencies
 */
import React from 'react';
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import { connect } from 'react-redux';
import QueryReaderTeams from 'components/data/query-reader-teams';
import { getReaderTeams } from 'state/selectors';

const BlogStickers = ( { blogId, teams } ) => {
	// If the user isn't in the a8c team, don't show the feature
	const isTeamMember = !! find( teams, [ 'slug', 'a8c' ] );

	if ( teams && ! isTeamMember ) {
		return null;
	}

	return (
		<div className="blog-stickers">
			{ isTeamMember && <h1>Blog stickers innit</h1> }
			{ ! teams && <QueryReaderTeams /> }
		</div>
	);
};

BlogStickers.propTypes = {
	blogId: React.PropTypes.number.isRequired,
};

export default connect( ( state, ownProps ) => {
	return {
		teams: getReaderTeams( state ),
	};
} )( BlogStickers );
