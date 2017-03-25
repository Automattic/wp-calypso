/**
 * External dependencies
 */
import React from 'react';
import { endsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import Gridicon from 'gridicons';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import { shouldBundleDomainWithPlan, getDomainPriceRule, hasDomainInCart } from 'lib/cart-values/cart-items';

const DomainRegistrationSuggestion = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		suggestion: React.PropTypes.shape( {
			domain_name: React.PropTypes.string.isRequired,
			product_slug: React.PropTypes.string,
			cost: React.PropTypes.string
		} ).isRequired,
		onButtonClick: React.PropTypes.func.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.object
	},

	render() {
		const { suggestion, translate } = this.props,
			isAdded = hasDomainInCart( this.props.cart, suggestion.domain_name ),
			domainFlags = [];
		let buttonClasses, buttonContent;

		if ( suggestion.domain_name ) {
			const newTLDs = [];

			if ( newTLDs.some(
					( tld ) =>
						endsWith( suggestion.domain_name, tld ) &&
						suggestion.domain_name.substring( 0, suggestion.domain_name.length - ( tld.length + 1 ) ).indexOf( '.' ) === -1
				) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ suggestion.domain_name }-new` }
						content={ translate( 'New' ) }
						status="success"
					/>
				);
			}
		}

		if ( suggestion.isRecommended ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ suggestion.domain_name }-recommended` }
					content={ translate( 'Recommended' ) }
					status="success"
				/>
			);
		}

		if ( suggestion.isBestAlternative ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ suggestion.domain_name }-best-alternative` }
					content={ translate( 'Best Alternative' ) }
				/>
			);
		}

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent = shouldBundleDomainWithPlan( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion )
				? translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: translate( 'Select', { context: 'Domain mapping suggestion button' } );
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
					{ domainFlags }
				</h3>
			</DomainSuggestion>
		);
	}
} );

export default localize( DomainRegistrationSuggestion );
