import { useTranslate } from 'i18n-calypso';

export default function ProductListingEmpty() {
	const translate = useTranslate();

	return (
		<div className="product-listing-empty">
			<div className="product-listing-empty__message-heading">
				{ translate( 'Sorry, no results found.' ) }
			</div>

			<div className="product-listing-empty__message-description">
				{ translate(
					"Please try refining your search and filtering to find what you're looking for."
				) }
			</div>
		</div>
	);
}
