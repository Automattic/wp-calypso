/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

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

	renderButton() {
		const buttonClasses = classNames( 'button', 'domain-suggestion__select-button', this.props.buttonClasses );
		return (
			<button
				ref="button"
				className={ buttonClasses }
				onClick={ this.props.onButtonClick }
				data-e2e-domain={ this.props.domain }>
					{ this.props.buttonContent }
			</button>
		);
	},

	render() {
		const { price, isAdded, extraClasses, children, priceRule } = this.props;
		let classes = classNames( 'domain-suggestion', 'card', 'is-compact', {
			'is-added': isAdded
		}, extraClasses );

		return (
			<div className={ classes }>
				<div className="domain-suggestion__content">
					{ children }
					<DomainProductPrice
						rule={ priceRule }
						price={ price }/>
				</div>
				<div className="domain-suggestion__action">
					{ this.renderButton() }
				</div>
			</div>
		);
	}
} );

DomainSuggestion.Placeholder = React.createClass( {
	render() {
		return (
			<div className="domain-suggestion card is-compact is-placeholder">
				<div className="domain-suggestion__content">
					<h3 />
				</div>
				<div className="domain-suggestion__action" />
			</div>
		);
	}
} );

export default DomainSuggestion;
