/**
 * External dependencies
 */
const React = require( 'react' ),
	classNames = require( 'classnames' ),
	times = require( 'lodash/times' );

import Notice from 'components/notice';

/**
 * Internal dependencies
 */
const DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainMappingSuggestion = require( 'components/domains/domain-mapping-suggestion' ),
	DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	{ isNextDomainFree } = require( 'lib/cart-values/cart-items' );

var DomainSearchResults = React.createClass( {
	propTypes: {
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		lastDomainError: React.PropTypes.object,
		lastDomainSearched: React.PropTypes.string,
		cart: React.PropTypes.object,
		products: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object,
		availableDomain: React.PropTypes.object,
		suggestions: React.PropTypes.array,
		placeholderQuantity: React.PropTypes.number.isRequired,
		buttonLabel: React.PropTypes.string,
		mappingSuggestionLabel: React.PropTypes.string,
		offerMappingOption: React.PropTypes.bool,
		onClickResult: React.PropTypes.func.isRequired,
		onAddMapping: React.PropTypes.func,
		onClickMapping: React.PropTypes.func
	},
	isDomainMappable: function() {
		return this.props.lastDomainError && this.props.lastDomainError.code === 'not_available_but_mappable';
	},

	domainAvailability: function() {
		var availableDomain = this.props.availableDomain,
			availabilityElementClasses = classNames( {
				'domain-search-results__domain-is-available': availableDomain,
				'domain-search-results__domain-not-available': ! availableDomain
			} ),
			domain = this.props.lastDomainSearched,
			suggestions = this.props.suggestions || [],
			availabilityElement,
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
		} else if ( suggestions.length !== 0 && this.isDomainMappable() && this.props.products.domain_map ) {
			const components = { a: <a href="#" onClick={ this.handleAddMapping } />, small: <small /> };

			if ( this.props.domainsWithPlansOnly ) {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}}' +
					' with WordPress.com Premium.{{/small}}', { args: { domain }, components }
				);
			} else if ( isNextDomainFree( this.props.cart ) ) {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for ' +
					'free.{{/small}}', { args: { domain }, components } );
			} else {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for ' +
					'%(cost)s.{{/small}}', { args: { domain, cost: this.props.products.domain_map.cost_display }, components } );
			}

			const domainUnavailableMessage = this.translate( '%(domain)s is taken.', { args: { domain } } );

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
		this.props.onAddMapping( { domain_name: this.props.lastDomainSearched } );
	},

	placeholders: function() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	},

	domainSuggestions: function() {
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
			suggestionElements = this.placeholders();
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
				{ this.domainAvailability() }
				{ this.domainSuggestions() }
			</div>
		);
	}
} );

module.exports = DomainSearchResults;
