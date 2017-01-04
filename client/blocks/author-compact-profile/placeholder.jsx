/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

const AuthorCompactProfilePlaceholder = () => {
	return (
		<div className="author-compact-profile is-placeholder">
			<ReaderAvatar author={ null } />
			<div className="author-compact-profile__site-link-placeholder">
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
