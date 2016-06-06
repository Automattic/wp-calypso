// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import { numberFormat } from 'i18n-calypso';

// Internal dependencies
import { getSite } from 'state/reader/sites/selectors';
import FollowButton from 'reader/follow-button';

const StartCardFooter = ( { site } ) => {
	const subscribersCount = numberFormat( site.subscribers_count );
	return (
		<footer className="reader-start-card-footer">
			<div className="reader-start-card__follower-count">
				<a href={ `/read/blogs/${site.ID}` }>{ subscribersCount } followers</a>
			</div>
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
