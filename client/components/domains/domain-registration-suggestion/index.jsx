/**
 * External dependencies
 */
import React from 'react';
import { includes, isNumber } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import Gridicon from 'gridicons';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import { shouldBundleDomainWithPlan, getDomainPriceRule, hasDomainInCart } from 'lib/cart-values/cart-items';
import { tracks } from 'lib/analytics';

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
		selectedSite: React.PropTypes.object,
		railcarId: React.PropTypes.string,
		uiPosition: React.PropTypes.number,
		fetchAlgo: React.PropTypes.string,
		query: React.PropTypes.string
	},

	componentDidMount() {
		if ( this.props.railcarId && isNumber( this.props.uiPosition ) ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			tracks.recordEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: this.props.fetchAlgo,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query
			} );
		}
	},

	onClick( event ) {
		if ( this.props.railcarId ) {
			tracks.recordEvent( 'calypso_traintracks_interact', {
				railcar: this.props.railcarId,
				action: 'domain_added_to_cart'
			} );
		}

		this.props.onButtonClick( event );
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
			buttonContent = ! isSignupStep && shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
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
					onButtonClick={ this.onClick }>
				<h3>
					{ domain }
					{ domainFlags }
				</h3>
			</DomainSuggestion>
		);
	}
} );

export default localize( DomainRegistrationSuggestion );
