/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

const ReaderSubscriptionListItemPlaceholder = () => {
	return (
		<div className="reader-subscription-list-item reader-subscription-list-item__placeholder">
			<div>
				<ReaderAvatar showPlaceholder={ true } isCompact={ true } />
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">
					Site title
				</span>
				<div className="reader-subscription-list-item__site-excerpt">
					Description of the site
				</div>
				<span className="reader-subscription-list-item__by-text">
					by author
				</span>
				<span className="reader-subscription-list-item__site-url">
					www.example.com
				</span>
			</div>
			<div className="reader-subscription-list-item__options">
				banana
			</div>
		</div>
	);
};

export default ReaderSubscriptionListItemPlaceholder;
