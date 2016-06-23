// External dependencies
import React from 'react';

// Internal dependencies
import Card from 'components/card';
import SiteIcon from 'components/site-icon';

const StartCardPlaceholder = ( {} ) => {
	return (
		<Card className="reader-start-card is-placeholder">
			<header className="reader-start-card__header">
				<SiteIcon site={ null } size={ 30 } />
				<div className="reader-start-card__site-info">
					<h1 className="reader-start-card__site-title">Site title</h1>
					<div className="reader-start-card__follower-count">
						Number of followers
					</div>
				</div>
			</header>
			<article className="reader-start-post-preview">
				<div className="reader-start-post-preview__featured-label">Featured Post</div>
				<div className="reader-start-post-preview__featured-image is-dark"></div>
				<div className="reader-start-post-preview__post-content">
					<h1 className="reader-start-post-preview__title">Post title</h1>
					<div className="reader-start-post-preview__byline">
						<span className="reader-start-post-preview__author">by author name</span>
					</div>
					<p className="reader-start-post-preview__excerpt">This is where the post excerpt will
					appear - just the first couple of lines of the post.</p>
				</div>
			</article>
		</Card>
	);
};

export default StartCardPlaceholder;
