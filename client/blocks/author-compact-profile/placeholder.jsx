/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

const AuthorCompactProfilePlaceholder = () => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
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
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default AuthorCompactProfilePlaceholder;
