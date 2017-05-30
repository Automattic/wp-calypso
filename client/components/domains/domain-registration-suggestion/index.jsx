/**
 * External dependencies
 */
import React from 'react';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import Gridicon from 'gridicons';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import { shouldBundleDomainWithPlan, getDomainPriceRule, hasDomainInCart } from 'lib/cart-values/cart-items';
import { abtest } from 'lib/abtest';

const DomainRegistrationSuggestion = React.createClass( {
	propTypes: {
		isSignupStep: React.PropTypes.bool,
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
		const { cart, domainsWithPlansOnly, isSignupStep, selectedSite, suggestion, translate } = this.props,
			domain = suggestion.domain_name,
			isAdded = hasDomainInCart( cart, domain ),
			domainFlags = [];

		let buttonClasses, buttonContent;

		if ( domain ) {
			const newTLDs = [];
			const testTLDs = [ '.ca', '.de', '.fr' ];
			// Grab everything after the first dot, so 'example.co.uk' will
			// match '.co.uk' but not '.uk'
			// This won't work if we add subdomains.
			const tld = domain.substring( domain.indexOf( '.' ) );

			if ( includes( newTLDs, tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-new` }
						content={ translate( 'New' ) }
						status="success"
					/>
				);
			}

			if ( includes( testTLDs, tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-testing` }
						content={ 'Testing only' }
						status="warning"
					/>
				);
			}
		}

		if ( suggestion.isRecommended ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ domain }-recommended` }
					content={ translate( 'Recommended' ) }
					status="success"
				/>
			);
		}

		if ( suggestion.isBestAlternative ) {
			domainFlags.push(
				<DomainSuggestionFlag
					key={ `${ domain }-best-alternative` }
					content={ translate( 'Best Alternative' ) }
				/>
			);
		}

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			const allowUpgradeCta = ! isSignupStep || abtest( 'selectCtaInDomainsSignup' ) === 'original';
			buttonContent = allowUpgradeCta && shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
				? translate( 'Upgrade', { context: 'Domain mapping suggestion button with plan upgrade' } )
				: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}

		return (
			<DomainSuggestion
					priceRule={ getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion ) }
					price={ suggestion.product_slug && suggestion.cost }
					domain={ domain }
					buttonClasses={ buttonClasses }
					buttonContent={ buttonContent }
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					onButtonClick={ this.props.onButtonClick }>
				<h3>
					{ domain }
					{ domainFlags }
				</h3>
			</DomainSuggestion>
		);
	}
} );

export default localize( DomainRegistrationSuggestion );
