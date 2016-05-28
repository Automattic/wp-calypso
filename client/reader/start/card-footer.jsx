// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import { getSite } from 'state/reader/sites/selectors';
import FollowButton from 'reader/follow-button';
import { numberFormat } from 'lib/mixins/i18n';

const StartCardFooter = ( { site } ) => {
	const subscribersCount = numberFormat( site.subscribers_count );
	return (
		<footer className="reader-start-card-footer">
			<div className="reader-start-card__follower-count">{ subscribersCount } followers</div>
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
