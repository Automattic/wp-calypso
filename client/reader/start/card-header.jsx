// External dependencies
import React from 'react';
import { numberFormat } from 'i18n-calypso';

// Internal dependencies
import SiteIcon from 'components/site-icon';
import FollowButton from 'reader/follow-button';

const StartCardHeader = ( { site, railcar, recommendationId } ) => {
	const subscribersCount = numberFormat( site.subscribers_count );
	const siteStreamUrl = `/read/blogs/${site.ID}?recommendationId=${recommendationId}`;
	return (
		<header className="reader-start-card__header">
			<a href={ siteStreamUrl }>
				<SiteIcon site={ site } size={ 30 } />
			</a>
			<div className="reader-start-card__site-info">
				<a href={ siteStreamUrl }>
					<h1 className="reader-start-card__site-title">{ site.title }</h1>
				</a>
				<div className="reader-start-card__follower-count">
					<a href={ siteStreamUrl }>{ subscribersCount } followers</a>
				</div>
			</div>
			<div className="reader-start-card__follow">
				<FollowButton siteUrl={ site.URL } recommendationId={ recommendationId } railcar={ railcar } />
			</div>
		</header>
	);
};

StartCardHeader.propTypes = {
	site: React.PropTypes.object.isRequired,
	railcar: React.PropTypes.object,
	recommendationId: React.PropTypes.number
};

export default StartCardHeader;
