/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'calypso/blocks/reader-avatar';

const ReaderListItemPlaceholder = () => {
	return (
		<div className="reader-list-item reader-list-item__placeholder">
			<div>
				<ReaderAvatar showPlaceholder={ true } isCompact={ true } />
			</div>
			<div className="reader-list-item__byline">
				<span className="reader-list-item__site-title is-placeholder">Site title</span>
				<div className="reader-list-item__site-excerpt is-placeholder">Description of the site</div>
				<span className="reader-list-item__by-text is-placeholder">by author name</span>
				<span className="reader-list-item__site-url is-placeholder">www.example.com</span>
			</div>
			<div className="reader-list-item__options">
				<div className="reader-list-item__follow">Follow here</div>
			</div>
		</div>
	);
};

export default ReaderListItemPlaceholder;
