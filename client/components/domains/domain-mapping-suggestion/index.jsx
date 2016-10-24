/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	{ shouldBundleDomainWithPlan, getDomainPriceRule } = require( 'lib/cart-values/cart-items' );

var DomainMappingSuggestion = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		products: React.PropTypes.object.isRequired,
		onButtonClick: React.PropTypes.func.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] )
	},
	render: function() {
		const suggestion = {
				product_slug: this.props.products.domain_map.product_slug,
				cost: this.props.products.domain_map.cost_display
			},
			buttonContent = shouldBundleDomainWithPlan( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion )
				? this.translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: this.translate( 'Map it', { context: 'Domain mapping suggestion button' } );
		return (
				<DomainSuggestion
					priceRule={ getDomainPriceRule( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) }
					price={ this.props.products.domain_map && this.props.products.domain_map.cost_display }
					extraClasses="is-visible domain-mapping-suggestion"
					buttonClasses="map"
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					buttonContent={ buttonContent }
					cart={ this.props.cart }
					onButtonClick={ this.props.onButtonClick }>
				<div className="domain-mapping-suggestion__domain-description">
					<h3>
						{ this.translate( 'Already own a domain?', {
							context: 'Upgrades: Register domain header',
							comment: 'Asks if you want to own a new domain (not if you want to map an existing domain).'
						} ) }
					</h3>
					<p>
						{ this.translate( 'Map this domain to use it as your site\'s address.', {
							context: 'Upgrades: Register domain description',
							comment: 'Explains how you could use a new domain name for your site\'s address.'
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
} );

module.exports = DomainMappingSuggestion;
