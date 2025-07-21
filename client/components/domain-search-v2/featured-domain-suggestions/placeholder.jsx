import './placeholder.scss';

export default function FeaturedDomainSuggestionsPlaceholder() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="featured-domain-suggestion featured-domain-suggestion--is-placeholder card is-compact is-clickable">
			<div className="domain-registration-suggestion__badges" />
			<div className="domain-suggestion__content">
				<div className="domain-registration-suggestion__title-info" />
				<div className="domain-product-price" />
			</div>
			<div className="domain-suggestion__action-container" />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
