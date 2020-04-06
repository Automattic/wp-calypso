/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

class PostPlaceholder extends React.PureComponent {
	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card tagName="article" className="reader__card is-placeholder">
				<div className="reader__post-header">
					<h1 className="reader__post-title">
						<div className="reader__post-title-link">
							<span className="reader__placeholder-text">Loading interesting posts…</span>
						</div>
					</h1>
					<div className="reader__post-byline">
						<span className="site-icon" height="16" width="16" />
						<h4 className="reader__site-name">
							<span className="reader__placeholder-text">Loading Sites</span>
						</h4>
						<div className="reader__post-time-placeholder">
							<span className="reader__placeholder-text">10 min</span>
						</div>
					</div>
				</div>

				<div className="reader__post-excerpt">
					<p>
						<span className="reader__placeholder-text">
							Please wait while we grab all the interesting posts, photos, videos and more to show
							you in Reader. It shouldn’t take long.
						</span>
					</p>
				</div>

				<ul className="reader__post-footer">
					<li className="reader__post-read-time">
						<span className="reader__placeholder-text">10 min read</span>
					</li>
				</ul>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default PostPlaceholder;
