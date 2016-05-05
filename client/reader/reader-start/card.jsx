// External dependencies
import React from 'react';

// Internal dependencies
import Card from 'components/card';
import SiteIcon from 'components/site-icon';
import FollowButton from 'reader/follow-button';
import ReaderStartPostPreview from './post-preview';

const ReaderStartCard = React.createClass( {
	render() {
		const site = null;
		const showPostPreview = true;
		return (
			<Card className="reader-start-card">
				<header>
					<SiteIcon site={ site } />
					<h3>The Adventures of Casey</h3>
					<p>Casey Schreiner shares his tips on planning your first solo camping trip around the world.</p>
				</header>
				{ showPostPreview ? <ReaderStartPostPreview /> : null }
				<footer>
					<div className="reader-start-card__follower-count">537,000 followers</div>
					<FollowButton siteUrl="http://futonbleu.wordpress.com" />
				</footer>
			</Card>
		);
	}
} );

export default ReaderStartCard;
