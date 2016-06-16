/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	Gridicon = require( 'components/gridicon' ),
	DomainSuggestionFlag = require( 'components/domains/domain-suggestion-flag' ),
	{ shouldBundleDomainWithPlan, getDomainPriceRule, hasDomainInCart } = require( 'lib/cart-values/cart-items' );

const DomainRegistrationSuggestion = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		suggestion: React.PropTypes.object.isRequired,
		onButtonClick: React.PropTypes.func.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.object
	},

	render() {
		var suggestion = this.props.suggestion || {},
			isAdded = hasDomainInCart( this.props.cart, suggestion.domain_name ),
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
			buttonContent = shouldBundleDomainWithPlan( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion )
				? this.translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: this.translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}

		return (
			<DomainSuggestion
					priceRule={ getDomainPriceRule( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) }
					price={ suggestion.product_slug && suggestion.cost }
					domain={ suggestion.domain_name }
					buttonClasses={ buttonClasses }
					buttonContent={ buttonContent }
					cart={ this.props.cart }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					onButtonClick={ this.props.onButtonClick }>
				<h3>
					{ suggestion.domain_name }
					{ domainFlag }
				</h3>
			</DomainSuggestion>
		);
	}
} );

module.exports = DomainRegistrationSuggestion;
