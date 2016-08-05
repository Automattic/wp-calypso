/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DomainProductPrice from 'components/domains/domain-product-price';
import Gridicon from 'components/gridicon';
import { abtest } from 'lib/abtest';

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

	renderNonButton() {
		return this.props.buttonContent;
	},

	render() {
		const clickableRow = true;//abtest( 'domainSuggestionClickableRow' ) === 'clickableRow';
		const { price, isAdded, extraClasses, children, priceRule } = this.props;
		let classes = classNames( 'domain-suggestion', 'card', 'is-compact', {
			'is-added': isAdded,
			'is-clickable': clickableRow,
		}, extraClasses );

		return (
			<div
				className={ classes }
				onClick={ clickableRow ? this.props.onButtonClick : undefined }
				aria-role={ clickableRow ? 'button' : undefined }>
				<div className="domain-suggestion__content">
					{ children }
					<DomainProductPrice
						rule={ priceRule }
						price={ price }/>
				</div>
				<div className={ clickableRow ? 'domain-suggestion__non-button-action' : 'domain-suggestion__action' }>
					{ clickableRow ? this.renderNonButton() : this.renderButton() }
				</div>
				{ clickableRow &&
					<div className="domain-suggestion__chevron"><Gridicon icon="chevron-right" /></div> }
			</div>
		);
	}
} );

DomainSuggestion.Placeholder = React.createClass( {
	render() {
		const clickableRow = true;//abtest( 'domainSuggestionClickableRow' ) === 'clickableRow';
		const classes = classNames( 'domain-suggestion', 'card', 'is-compact', 'is-placeholder', {
			'is-clickable': clickableRow,
		} );
		return (
			<div className={ classes }>
				<div className="domain-suggestion__content">
					<h3 />
				</div>
				<div className={ clickableRow ? 'domain-suggestion__non-button-action' : 'domain-suggestion__action' } />
				{ clickableRow &&
					<div className="domain-suggestion__chevron"><Gridicon icon="chevron-right" /></div> }
			</div>
		);
	}
} );

export default DomainSuggestion;
