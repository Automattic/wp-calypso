/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'ExampleSiteTitle',

	render: function() {
		return (
			<div className="site-title__example-site-title">
				<p className="site-title__example-site-title__explanation">
					{ this.translate( 'A site title is your site slogan.' ) }
				</p>
				<div className="site-title__example-site-title__browser">
					<svg width="269" height="135" viewBox="0 0 269 135" xmlns="http://www.w3.org/2000/svg"><title>Group</title><defs><linearGradient x1="0%" y1="0%" x2="0%" y2="100%" id="a"><stop stop-color="#E2EBF2" offset="0%"/><stop stop-color="#F3F6F8" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><path fill="url(#a)" d="M0 24h269v111H0z"/><path d="M0 24h269V3.99c0-2.204-.947-3.99-2.107-3.99H2.107C.943 0 0 1.784 0 3.99V24M28 75h182v12H28zM28 93h139v12H28z" fill="#C8D7E1"/><text font-family="SFUIText-Medium, SF UI Text" font-size="15" font-weight="400" fill="#556875"><tspan x="28.256" y="59">Your Site Title</tspan></text></g></svg>
				</div>
			</div>
		);
	}
} );
