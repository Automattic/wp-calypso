// External dependencies
import React from 'react';
import { numberFormat } from 'i18n-calypso';

// Internal dependencies
import SiteIcon from 'components/site-icon';
import FollowButton from 'reader/follow-button';

const StartCardHeader = ( { site, railcar } ) => {
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
			<div className="reader-start-card__follow">
				<FollowButton siteUrl={ site.URL } railcar={ railcar } />
			</div>
		</header>
	);
};

StartCardHeader.propTypes = {
	site: React.PropTypes.object.isRequired,
	railcar: React.PropTypes.object
};

export default StartCardHeader;
