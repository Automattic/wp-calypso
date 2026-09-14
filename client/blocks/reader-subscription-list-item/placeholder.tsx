import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

const ReaderSubscriptionListItemPlaceholder = (): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="reader-subscription-list-item reader-subscription-list-item__placeholder">
			<div>
				<span className="reader-subscription-list-item__site-avatar is-placeholder"></span>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title is-placeholder">
					{ translate( 'Site title' ) }
				</span>
				<div className="reader-subscription-list-item__site-excerpt is-placeholder">
					{ translate( 'Description of the site' ) }
				</div>
				<span className="reader-subscription-list-item__by-text is-placeholder">
					{ translate( 'by author name' ) }
				</span>
				<span className="reader-subscription-list-item__site-url is-placeholder">
					www.example.com
				</span>
			</div>
			<div className="reader-subscription-list-item__options">
				<div className="reader-subscription-list-item__follow">{ translate( 'Follow here' ) }</div>
			</div>
		</div>
	);
};

export default ReaderSubscriptionListItemPlaceholder;
