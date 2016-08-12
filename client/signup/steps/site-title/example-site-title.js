/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'ExampleSiteTitle',

	render: function() {
		return (
			<div className="example-site-title">
				<p className="example-site-title__description">
					{ this.translate( 'Your site title is often shown at the top of your website.' ) }
				</p>
				<div className="example-site-title__image">
					<svg width="269" height="135" viewBox="0 0 269 135" xmlns="http://www.w3.org/2000/svg"><title>Group</title><g fill="none" fill-rule="evenodd"><path fill="#E9EFF3" d="M0 24h269v111H0z"/><path d="M0 24h269V3.99c0-2.204-.947-3.99-2.107-3.99H2.107C.943 0 0 1.784 0 3.99V24M28 75h182v12H28zM28 93h139v12H28z" fill="#C8D7E1"/><text font-family="SFUIText-Medium, SF UI Text" font-size="15" font-weight="400" fill="#556875" transform="translate(-345 -213)"><tspan x="373.256" y="272">Your Site Title</tspan></text></g></svg>
				</div>
			</div>
		);
	}
} );
