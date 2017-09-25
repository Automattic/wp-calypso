/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import { shouldBundleDomainWithPlan, getDomainPriceRule } from 'lib/cart-values/cart-items';

class DomainMappingSuggestion extends React.Component {
	static propTypes = {
		isSignupStep: PropTypes.bool,
		cart: PropTypes.object,
		products: PropTypes.object.isRequired,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] )
	};

	render() {
		const suggestion = {
			product_slug: this.props.products.domain_map.product_slug,
			cost: this.props.products.domain_map.cost_display
		};
		const { cart, domainsWithPlansOnly, isSignupStep, selectedSite, translate } = this.props;
		const buttonContent = ! isSignupStep && shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
			? translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
			: translate( 'Map it', { context: 'Domain mapping suggestion button' } );

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
						{ translate( 'Already own a domain?', {
							context: 'Upgrades: Register domain header',
							comment: 'Asks if you want to own a new domain (not if you want to map an existing domain).'
						} ) }
					</h3>
					<p>
						{ translate( 'Map this domain to use it as your site\'s address.', {
							context: 'Upgrades: Register domain description',
							comment: 'Explains how you could use a new domain name for your site\'s address.'
						} ) }
					</p>
				</div>
			</DomainSuggestion>
		);
	}
}

export default localize( DomainMappingSuggestion );
