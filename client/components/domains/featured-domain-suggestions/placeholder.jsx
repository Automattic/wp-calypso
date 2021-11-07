import './placeholder.scss';

export default function FeaturedDomainSuggestionsPlaceholder() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="featured-domain-suggestion featured-domain-suggestion--is-placeholder card is-compact is-clickable">
			<div className="domain-suggestion__content">
				<div className="domain-registration-suggestion__title" />
				<div className="domain-product-price" />
				<div className="domain-registration-suggestion__badges" />
				<div className="domain-registration-suggestion__match-reasons" />
			</div>
			<div className="domain-suggestion__action" />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
