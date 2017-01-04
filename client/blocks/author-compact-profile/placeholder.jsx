/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */

const AuthorCompactProfilePlaceholder = () => {
	return (
		<div className="author-compact-profile is-placeholder">
			<div className="gravatar author-compact-profile__avatar-placeholder"></div>
			<div className="author-compact-profile__site-link is-placeholder">
				Site name
			</div>
			<div className="author-compact-profile__follow">
				<div className="author-compact-profile__follow-count is-placeholder">
					Number of followers
				</div>
			</div>
		</div>
	);
};

export default AuthorCompactProfilePlaceholder;
