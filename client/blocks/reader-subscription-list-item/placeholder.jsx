/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'calypso/blocks/reader-avatar';

const ReaderSubscriptionListItemPlaceholder = () => {
	return (
		<div className="reader-subscription-list-item reader-subscription-list-item__placeholder">
			<div>
				<ReaderAvatar showPlaceholder isCompact />
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title is-placeholder">Site title</span>
				<div className="reader-subscription-list-item__site-excerpt is-placeholder">
					Description of the site
				</div>
				<span className="reader-subscription-list-item__by-text is-placeholder">
					by author name
				</span>
				<span className="reader-subscription-list-item__site-url is-placeholder">
					www.example.com
				</span>
			</div>
			<div className="reader-subscription-list-item__options">
				<div className="reader-subscription-list-item__follow">Follow here</div>
			</div>
		</div>
	);
};

export default ReaderSubscriptionListItemPlaceholder;
