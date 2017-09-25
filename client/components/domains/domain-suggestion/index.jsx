/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainProductPrice from 'components/domains/domain-product-price';

class DomainSuggestion extends React.Component {
	static propTypes = {
		buttonContent: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ).isRequired,
		buttonClasses: PropTypes.string,
		extraClasses: PropTypes.string,
		onButtonClick: PropTypes.func.isRequired,
		priceRule: PropTypes.string.isRequired,
		price: PropTypes.string,
		domain: PropTypes.string
	};

	render() {
		const { price, isAdded, extraClasses, children, priceRule } = this.props;
		const classes = classNames(
			'domain-suggestion',
			'card',
			'is-compact',
			'is-clickable',
			{
				'is-added': isAdded,
			},
			extraClasses
		);

		return (
			<div
				className={ classes }
				onClick={ this.props.onButtonClick }
				role="button"
				data-e2e-domain={ this.props.domain }>
				<div className="domain-suggestion__content">
					{ children }
					<DomainProductPrice
						rule={ priceRule }
						price={ price }
					/>
				</div>
				<div className="domain-suggestion__action">
					{ this.props.buttonContent }
				</div>
				<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
			</div>
		);
	}
}

DomainSuggestion.Placeholder = function() {
	return (
		<div className="domain-suggestion card is-compact is-placeholder is-clickable">
			<div className="domain-suggestion__content">
				<h3 />
			</div>
			<div className="domain-suggestion__action" />
			<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
		</div>
	);
};

export default DomainSuggestion;
