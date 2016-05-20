// External dependencies
import React from 'react';

// Internal dependencies
import Card from 'components/card';
import SiteIcon from 'components/site-icon';
import FollowButton from 'reader/follow-button';
import StartPostPreview from './post-preview';

const StartCard = React.createClass( {
	render() {
		const site = null;
		const showPostPreview = true;
		return (
			<Card className="reader-start-card">
				<div className="reader-start-card__hero"></div>
				<header>
					<SiteIcon site={ site } size={ 70 } />
					<h1>The Adventures of Casey</h1>
					<p>Casey Schreiner shares his tips on planning your first solo camping trip around the world.</p>
				</header>
				{ showPostPreview ? <StartPostPreview /> : null }
				<footer>
					<div className="reader-start-card__follower-count">537,000 Followers</div>
					<FollowButton siteUrl="http://jancavan.wordpress.com" />
				</footer>
			</Card>
		);
	}
} );

export default StartCard;
