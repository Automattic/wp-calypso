/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DomainProductPrice from 'components/domains/domain-product-price';

const DomainSuggestion = React.createClass( {

	propTypes: {
		buttonContent: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
		buttonClasses: React.PropTypes.string,
		extraClasses: React.PropTypes.string,
		onButtonClick: React.PropTypes.func.isRequired,
		priceRule: React.PropTypes.string.isRequired,
		price: React.PropTypes.string,
		domain: React.PropTypes.string
	},

	render() {
		const { price, isAdded, extraClasses, children, priceRule } = this.props;
		const classes = classNames( 'domain-suggestion', 'card', 'is-compact', 'is-clickable', {
			'is-added': isAdded,
		}, extraClasses );

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
						price={ price } />
				</div>
				<div className="domain-suggestion__action">
					{ this.props.buttonContent }
				</div>
				<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
			</div>
		);
	}
} );

DomainSuggestion.Placeholder = React.createClass( {
	render() {
		const classes = classNames( 'domain-suggestion', 'card', 'is-compact', 'is-placeholder', {
			'is-clickable': true,
		} );
		return (
			<div className={ classes }>
				<div className="domain-suggestion__content">
					<h3 />
				</div>
				<div className="domain-suggestion__action" />
				<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
			</div>
		);
	}
} );

export default DomainSuggestion;
