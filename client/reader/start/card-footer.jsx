// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import { getSite } from 'state/reader/sites/selectors';
import FollowButton from 'reader/follow-button';

const StartCardFooter = ( { site } ) => {
	return (
		<footer>
			<div className="reader-start-card__follower-count">{ site.subscribers_count } followers</div>
			<FollowButton siteUrl={ site.URL } />
		</footer>
	);
};

StartCardFooter.propTypes = {
	siteId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.siteId )
		};
	}
)( StartCardFooter );
