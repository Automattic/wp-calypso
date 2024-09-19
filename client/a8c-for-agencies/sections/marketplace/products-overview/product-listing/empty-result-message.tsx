import { Card } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export default function EmptyResultMessage() {
	const translate = useTranslate();

	return (
		<Card className="product-listing__empty-result-message">
			<div className="product-listing__empty-result-message-heading">
				{ translate( 'Sorry, no results found.' ) }
			</div>

			<div className="product-listing__empty-result-message-description">
				{ translate(
					"Please try refining your search and filtering to find what you're looking for."
				) }
			</div>
		</Card>
	);
}
