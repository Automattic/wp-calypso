/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { endsWith, includes, times } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import Notice from 'components/notice';
import { isNextDomainFree } from 'lib/cart-values/cart-items';
import { getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import { getSelectedSiteId } from 'state/ui/selectors';

class DomainSearchResults extends React.Component {
	static propTypes = {
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		lastDomainStatus: PropTypes.string,
		lastDomainSearched: PropTypes.string,
		cart: PropTypes.object,
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		availableDomain: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ),
		suggestions: PropTypes.array,
		placeholderQuantity: PropTypes.number.isRequired,
		buttonLabel: PropTypes.string,
		mappingSuggestionLabel: PropTypes.string,
		offerMappingOption: PropTypes.bool,
		onClickResult: PropTypes.func.isRequired,
		onAddMapping: PropTypes.func,
		onClickMapping: PropTypes.func,
		isSignupStep: PropTypes.bool,
		railcarSeed: PropTypes.string,
		fetchAlgo: PropTypes.string
	};

	renderDomainAvailability() {
		const { availableDomain, lastDomainStatus, lastDomainSearched: domain, translate } = this.props;
		const availabilityElementClasses = classNames( {
			'domain-search-results__domain-is-available': availableDomain,
			'domain-search-results__domain-not-available': ! availableDomain
		} );
		const suggestions = this.props.suggestions || [];
		const { MAPPABLE, UNKNOWN } = domainAvailability;

		let availabilityElement, domainSuggestionElement, mappingOffer;

		if ( availableDomain ) {
			// should use real notice component or custom class
			availabilityElement = (
				<Notice
					status="is-success"
					showDismiss={ false }>
					{ translate( '%(domain)s is available!', { args: { domain } } ) }
				</Notice>
			);

			domainSuggestionElement = (
				<DomainRegistrationSuggestion
					suggestion={ availableDomain }
					key={ availableDomain.domain_name }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					buttonContent={ this.props.buttonContent }
					selectedSite={ this.props.selectedSite }
					cart={ this.props.cart }
					isSignupStep={ this.props.isSignupStep }
					onButtonClick={ this.props.onClickResult } />
				);
		} else if ( suggestions.length !== 0 && includes( [ MAPPABLE, UNKNOWN ], lastDomainStatus ) && this.props.products.domain_map ) {
			const components = { a: <a href="#" onClick={ this.handleAddMapping } />, small: <small /> };

			if ( isNextDomainFree( this.props.cart ) ) {
				mappingOffer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for free.{{/small}}',
					{ args: { domain }, components }
				);
			} else if ( ! this.props.domainsWithPlansOnly || this.props.isSiteOnPaidPlan ) {
				mappingOffer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for %(cost)s.{{/small}}',
					{ args: { domain, cost: this.props.products.domain_map.cost_display }, components }
				);
			} else {
				mappingOffer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} with WordPress.com Premium.{{/small}}',
					{ args: { domain }, components }
				);
			}

			const domainUnavailableMessage = lastDomainStatus === UNKNOWN
				? translate( '.%(tld)s domains are not offered on WordPress.com.', { args: { tld: getTld( domain ) } } )
				: translate( '%(domain)s is taken.', { args: { domain } } );

			if ( this.props.offerMappingOption ) {
				availabilityElement = (
					<Notice
						status="is-warning"
						showDismiss={ false }>
						{ domainUnavailableMessage } { mappingOffer }
					</Notice>
				);
			}
		}

		return (
			<div className="domain-search-results__domain-availability">
				<div className={ availabilityElementClasses }>
					{ availabilityElement }
					{ domainSuggestionElement }
				</div>
			</div>
		);
	}

	handleAddMapping = () => {
		this.props.onAddMapping( this.props.lastDomainSearched );
	};

	renderPlaceholders() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	}

	renderDomainSuggestions() {
		let suggestionElements, mappingOffer;

		if ( this.props.suggestions.length ) {
			suggestionElements = this.props.suggestions.map( function( suggestion, i ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						isSignupStep={ this.props.isSignupStep }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						railcarId={ `${ this.props.railcarSeed }-registration-suggestion-${ i }` }
						uiPosition={ i }
						fetchAlgo={ endsWith( suggestion.domain_name, '.wordpress.com' ) ? 'wpcom' : this.props.fetchAlgo }
						query={ this.props.lastDomainSearched }
						onButtonClick={ this.props.onClickResult } />
				);
			}, this );

			if ( this.props.offerMappingOption ) {
				mappingOffer = (
					<DomainMappingSuggestion
						onButtonClick={ this.props.onClickMapping }
						products={ this.props.products }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						isSignupStep={ this.props.isSignupStep }
						cart={ this.props.cart }
					/>
				);
			}
		} else {
			suggestionElements = this.renderPlaceholders();
		}

		return (
			<div className="domain-search-results__domain-suggestions">
				{ suggestionElements }
				{ mappingOffer }
			</div>
		);
	}

	render() {
		return (
			<div className="domain-search-results">
				{ this.renderDomainAvailability() }
				{ this.renderDomainSuggestions() }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isSiteOnPaidPlan: isSiteOnPaidPlan( state, selectedSiteId ),
	};
};

export default connect(
	mapStateToProps
)( localize( DomainSearchResults ) );
