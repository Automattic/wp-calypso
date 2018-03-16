/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isNumber } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import {
	shouldBundleDomainWithPlan,
	getDomainPriceRule,
	hasDomainInCart,
} from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import { isNewTLD, isTestTLD } from 'components/domains/domain-registration-suggestion/utility';

class DomainRegistrationSuggestion extends React.Component {
	static propTypes = {
		isSignupStep: PropTypes.bool,
		cart: PropTypes.object,
		suggestion: PropTypes.shape( {
			domain_name: PropTypes.string.isRequired,
			product_slug: PropTypes.string,
			cost: PropTypes.string,
		} ).isRequired,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object,
		railcarId: PropTypes.string,
		recordTracksEvent: PropTypes.func,
		uiPosition: PropTypes.number,
		fetchAlgo: PropTypes.string,
		query: PropTypes.string,
	};

	componentDidMount() {
		if ( this.props.railcarId && isNumber( this.props.uiPosition ) ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			this.props.recordTracksEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: this.props.fetchAlgo,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query,
			} );
		}
	}

	onButtonClick = () => {
		if ( this.props.railcarId ) {
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				railcar: this.props.railcarId,
				action: 'domain_added_to_cart',
			} );
		}

		this.props.onButtonClick( this.props.suggestion );
	};

	getDomainFlags() {
		const { suggestion, translate } = this.props;
		const domain = suggestion.domain_name;
		const domainFlags = [];

		if ( domain ) {
			// Grab everything from the first dot, so 'example.co.uk' will
			// match '.co.uk' but not '.uk'
			// This won't work if we add subdomains.
			const tld = domain.substring( domain.indexOf( '.' ) );

			if ( isNewTLD( tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-new` }
						content={ translate( 'New' ) }
						status="success"
					/>
				);
			}

			if ( isTestTLD( tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-testing` }
						content={ 'Testing only' }
						status="warning"
					/>
				);
			}
		}

		return domainFlags;
	}

	getButtonProps() {
		const {
			cart,
			domainsWithPlansOnly,
			isSignupStep,
			selectedSite,
			suggestion,
			translate,
		} = this.props;
		const domain = suggestion.domain_name;
		const isAdded = hasDomainInCart( cart, domain );

		let buttonClasses, buttonContent;

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent =
				! isSignupStep &&
				shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
					? translate( 'Upgrade', {
							context: 'Domain mapping suggestion button with plan upgrade',
						} )
					: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}
		return {
			buttonClasses,
			buttonContent,
		};
	}

	render() {
		const { cart, domainsWithPlansOnly, selectedSite, suggestion } = this.props;
		const { domain_name: domain } = suggestion;

		return (
			<DomainSuggestion
				priceRule={ getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion ) }
				price={ suggestion.product_slug && suggestion.cost }
				domain={ domain }
				domainsWithPlansOnly={ domainsWithPlansOnly }
				onButtonClick={ this.onButtonClick }
				{ ...this.getButtonProps() }
			>
				<h3>
					{ domain }
					{ this.getDomainFlags() }
				</h3>
			</DomainSuggestion>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( DomainRegistrationSuggestion ) );
