/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import {
	includes,
	times
} from 'lodash';

/**
 * Internal dependencies
 */
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import { isNextDomainFree } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import { getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';

var DomainSearchResults = React.createClass( {
	propTypes: {
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		lastDomainStatus: React.PropTypes.string,
		lastDomainSearched: React.PropTypes.string,
		cart: React.PropTypes.object,
		products: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object,
		availableDomain: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		suggestions: React.PropTypes.array,
		placeholderQuantity: React.PropTypes.number.isRequired,
		buttonLabel: React.PropTypes.string,
		mappingSuggestionLabel: React.PropTypes.string,
		offerMappingOption: React.PropTypes.bool,
		onClickResult: React.PropTypes.func.isRequired,
		onAddMapping: React.PropTypes.func,
		onClickMapping: React.PropTypes.func
	},

	renderDomainAvailability: function() {
		const { availableDomain, lastDomainStatus, lastDomainSearched: domain } = this.props,
			availabilityElementClasses = classNames( {
				'domain-search-results__domain-is-available': availableDomain,
				'domain-search-results__domain-not-available': ! availableDomain
			} ),
			suggestions = this.props.suggestions || [],
			{ MAPPABLE, UNKNOWN } = domainAvailability;
		let availabilityElement,
			domainSuggestionElement,
			mappingOffer;

		if ( availableDomain ) {
			// should use real notice component or custom class
			availabilityElement = (
				<Notice
					status="is-success"
					showDismiss={ false }>
					{ this.translate( '%(domain)s is available!', { args: { domain } } ) }
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
					onButtonClick={ this.props.onClickResult.bind( null, availableDomain ) } />
				);
		} else if ( suggestions.length !== 0 && includes( [ MAPPABLE, UNKNOWN ], lastDomainStatus ) && this.props.products.domain_map ) {
			const components = { a: <a href="#" onClick={ this.handleAddMapping } />, small: <small /> };

			if ( isNextDomainFree( this.props.cart ) ) {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for ' +
					'free.{{/small}}', { args: { domain }, components } );
			} else if ( ! this.props.domainsWithPlansOnly ) {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for ' +
					'%(cost)s.{{/small}}', { args: { domain, cost: this.props.products.domain_map.cost_display }, components } );
			} else {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}}' +
					' with WordPress.com Premium.{{/small}}', { args: { domain }, components }
				);
			}

			const domainUnavailableMessage = lastDomainStatus === UNKNOWN
				? this.translate( '.%(tld)s domains are not offered on WordPress.com.', { args: { tld: getTld( domain ) } } )
				: this.translate( '%(domain)s is taken.', { args: { domain } } );

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
	},

	handleAddMapping: function( event ) {
		event.preventDefault();
		this.props.onAddMapping( this.props.lastDomainSearched );
	},

	renderPlaceholders: function() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	},

	renderDomainSuggestions: function() {
		var suggestionElements,
			mappingOffer;

		if ( this.props.suggestions.length ) {
			suggestionElements = this.props.suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						onButtonClick={ this.props.onClickResult.bind( null, suggestion ) } />
				);
			}, this );

			if ( this.props.offerMappingOption ) {
				mappingOffer = (
					<DomainMappingSuggestion
						onButtonClick={ this.props.onClickMapping }
						products={ this.props.products }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						cart={ this.props.cart } />
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
	},

	render: function() {
		return (
			<div className="domain-search-results">
				{ this.renderDomainAvailability() }
				{ this.renderDomainSuggestions() }
			</div>
		);
	}
} );

module.exports = DomainSearchResults;
