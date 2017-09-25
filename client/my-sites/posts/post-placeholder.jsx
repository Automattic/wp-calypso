/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default localize( React.createClass( {

	displayName: 'PostPlaceholder',

	render: function() {
		return (
		    <Card tagName="article" className="post is-placeholder">
				<div className="post__body">
					<header className="post-attribution"><span><span className="post-attribution-avatar is-rounded"></span><span className="placeholder-text">{ this.props.translate( 'A Great Author on a Fantastic Site' ) }</span></span></header>
					<div className="post__content">
						<h4 className="post__title post__title-link"><span className="placeholder-text">{ this.props.translate( 'Loading Posts…' ) }</span></h4>
						<div className="post__excerpt">
							<p><span className="placeholder-text">{ this.props.translate( 'Currently fetching the latest and greatest posts from your site(s). Looking good.' ) }</span></p>
						</div>
					</div>
				<footer className="post__info">
					<div className="post__time"><span className="placeholder-text">{ this.props.translate( 'Near future' ) }</span></div>
				</footer>
				</div>
				<div className="post-controls">
					<ul className="post-controls__pane post-controls__main-options">
						<li><a></a></li>
						<li><a></a></li>
						<li><a></a></li>
						<li><a></a></li>
					</ul>
				</div>
			</Card>
		);
	}
} ) );
