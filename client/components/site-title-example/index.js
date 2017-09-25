/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React from 'react';

export default () => {
	return (
		<div className="site-title-example">
			<p className="site-title-example__description">
				{ translate( 'Your Site Title is the name of your Blog or Website. It\'s often displayed at the top of your site.' ) }
			</p>
			<div className="site-title-example__image">
				<svg width="269" height="135" viewBox="0 0 269 135" xmlns="http://www.w3.org/2000/svg">
					<title>Group</title>
					<g fill="none" fillRule="evenodd">
						<path fill="#E9EFF3" d="M0 24h269v111H0z" />
						<path d="M0 24h269V3.99c0-2.204-.947-3.99-2.107-3.99H2.107C.943 0 0 1.784 0 3.99V24M28 75h182v12H28zM28 93h139v12H28z" fill="#C8D7E1" />
						<text fontSize="15" fontWeight="400" fill="#556875" transform="translate(-345 -213)">
							<tspan x="373.256" y="272">Your Site Title</tspan>
						</text>
					</g>
				</svg>
			</div>
		</div>
	);
};
