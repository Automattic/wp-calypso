/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	cartItems = require( 'lib/cart-values/cart-items' ),
	Gridicon = require( 'components/gridicon' ),
	DomainSuggestionFlag = require( 'components/domains/domain-suggestion-flag' ),
	DomainSuggestionMixin = require( 'components/domains/mixins/domain-suggestion-mixin' );

const DomainRegistrationSuggestion = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		suggestion: React.PropTypes.object.isRequired,
		onButtonClick: React.PropTypes.func.isRequired,
		withPlansOnly: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},
	mixins: [ DomainSuggestionMixin ],

	render() {
		var suggestion = this.props.suggestion || {},
			domainName = suggestion.domain_name || this.translate( 'Loading\u2026' ),
			isAdded = !! ( this.props.cart && cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ),
			buttonClasses,
			buttonContent,
			domainFlag = null;

		if ( suggestion.domain_name ) {
			domainFlag = <DomainSuggestionFlag domain={ suggestion.domain_name }/>;
		}

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent = this.willBundle( this.props.withPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) ? this.translate( 'Upgrade' ) : this.translate( 'Select' );
		}

		return (
			<DomainSuggestion
					priceRule={ this.getPriceRule( this.props.withPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) }
					price={ suggestion.product_slug && suggestion.cost }
					domain={ suggestion.domain_name }
					buttonClasses={ buttonClasses }
					buttonContent={ buttonContent }
					cart={ this.props.cart }
					withPlansOnly={ this.props.withPlansOnly }
					onButtonClick={ this.props.onButtonClick }>
				<h3>
					{ domainName }
					{ domainFlag }
				</h3>
			</DomainSuggestion>
		);
	}
} );

module.exports = DomainRegistrationSuggestion;
