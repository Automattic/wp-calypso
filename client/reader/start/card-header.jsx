// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import { numberFormat } from 'i18n-calypso';

// Internal dependencies
import SiteIcon from 'components/site-icon';
import { getSite } from 'state/reader/sites/selectors';
import FollowButton from 'reader/follow-button';

const StartCardHeader = ( { site } ) => {
	const subscribersCount = numberFormat( site.subscribers_count );
	return (
		<header className="reader-start-card__header">
			<a href={ `/read/blogs/${site.ID}` }>
				<SiteIcon site={ site } size={ 30 } />
			</a>
			<div className="reader-start-card__site-info">
				<a href={ `/read/blogs/${site.ID}` }>
					<h1 className="reader-start-card__site-title">{ site.title }</h1>
				</a>
				<div className="reader-start-card__follower-count">
					<a href={ `/read/blogs/${site.ID}` }>{ subscribersCount } followers</a>
				</div>
			</div>
			<FollowButton siteUrl={ site.URL } />
		</header>
	);
};

StartCardHeader.propTypes = {
	siteId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.siteId )
		};
	}
)( StartCardHeader );
