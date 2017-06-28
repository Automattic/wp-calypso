/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import { shouldBundleDomainWithPlan, getDomainPriceRule } from 'lib/cart-values/cart-items';

var DomainMappingSuggestion = React.createClass( {
	propTypes: {
		isSignupStep: React.PropTypes.bool,
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
			{ cart, domainsWithPlansOnly, isSignupStep, selectedSite } = this.props,
			buttonContent = ! isSignupStep && shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
				? this.translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: this.translate( 'Map it', { context: 'Domain mapping suggestion button' } );

		return (
				<DomainSuggestion
					priceRule={ getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion ) }
					price={ this.props.products.domain_map && this.props.products.domain_map.cost_display }
					extraClasses="is-visible domain-mapping-suggestion"
					buttonClasses="map"
					domainsWithPlansOnly={ domainsWithPlansOnly }
					buttonContent={ buttonContent }
					cart={ cart }
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
