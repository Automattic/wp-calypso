/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'calypso/blocks/reader-avatar';

const AuthorCompactProfilePlaceholder = () => {
	return (
		<div className="author-compact-profile is-placeholder">
			<div className="author-compact-profile__avatar-link">
				<ReaderAvatar showPlaceholder={ true } />
			</div>
			<div className="author-compact-profile__site-link is-placeholder">Site name</div>
			<div className="author-compact-profile__follow">
				<div className="author-compact-profile__follow-count is-placeholder">
					Number of followers
				</div>
			</div>
		</div>
	);
};

export default AuthorCompactProfilePlaceholder;
