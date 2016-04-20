/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DomainProductPrice = require( 'components/domains/domain-product-price' ),
	Gridicon = require( 'components/gridicon' );

var DomainSuggestion = React.createClass( {

	propTypes: {
		buttonLabel: React.PropTypes.string,
		buttonClasses: React.PropTypes.string,
		extraClasses: React.PropTypes.string,
		onButtonClick: React.PropTypes.func,
		price: React.PropTypes.string,
		cart: React.PropTypes.object,
		isAdded: React.PropTypes.bool.isRequired,
		withPlansOnly: React.PropTypes.bool
	},

	renderButton: function() {
		var buttonContent;
		if ( this.props.isAdded ) {
			buttonContent = <Gridicon icon="checkmark" ref="checkmark" />;
		} else {
			buttonContent = this.props.withPlansOnly && ! this.props.price ? this.translate( 'Select' ) : this.props.buttonLabel;
		}
		return (
			<button ref="button" className={ 'button ' + this.props.buttonClasses } onClick={ this.props.onButtonClick }>
				{ buttonContent }
			</button>
		);
	},

	render: function() {
		var classes = classNames( 'domain-suggestion', 'card', 'is-compact', {
			'is-placeholder': this.props.isLoading,
			'is-added': this.props.isAdded
		}, this.props.extraClasses );

		return (
			<div className={ classes }>
				<div className="domain-suggestion__content">
					{ this.props.children }
					<DomainProductPrice
						withPlansOnly={ this.props.withPlansOnly }
						isLoading={ this.props.isLoading }
						price={ this.props.price }
						cart={ this.props.cart }/>
				</div>
				<div className="domain-suggestion__action">
					{ this.renderButton() }
				</div>
			</div>
		);
	}
} );

module.exports = DomainSuggestion;
