/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	page = require( 'page' ),
	times = require( 'lodash/times' ),
	includes = require( 'lodash/includes' ),
	Notice = require( 'components/notice' );

/**
 * Internal dependencies
 */
var DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainMappingSuggestion = require( 'components/domains/domain-mapping-suggestion' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	upgradesActions = require( 'lib/upgrades/actions' );

var DomainSearchResults = React.createClass( {
	isDomainUnavailable: function() {
		return this.props.lastDomainError &&
			includes( [ 'not_available', 'not_available_but_mappable' ], this.props.lastDomainError.code );
	},

	domainAvailability: function() {
		var availableDomain = this.props.availableDomain,
			availabilityElementClasses = classNames( {
				'domain-search-results__domain-is-available': availableDomain,
				'domain-search-results__domain-not-available': ! availableDomain
			} ),
			lastDomainSearched = this.props.lastDomainSearched,
			availabilityElement,
			domainSuggestionElement,
			mappingOffer;

		if ( availableDomain ) {
			// should use real notice component or custom class
			availabilityElement = (
				<Notice
					className="domain-search-results__domain-availability-copy"
					status="is-success"
					showDismiss={ false }>
					{
						this.translate(
							'%(domain)s is available!',
							{ args: { domain: lastDomainSearched } }
						)
					}
				</Notice>
			);

			domainSuggestionElement = (
				<DomainRegistrationSuggestion
					suggestion={ availableDomain }
					key={ availableDomain.domain_name }
					buttonLabel={ this.props.buttonLabel }
					cart={ this.props.cart }
					withPlansOnly={ this.props.withPlansOnly }
					onButtonClick={ this.props.onClickResult.bind( null, availableDomain ) } />
				);
		} else if ( this.props.suggestions && this.props.suggestions.length !== 0 && this.isDomainUnavailable() ) {
			if ( this.props.products.domain_map && this.props.lastDomainError.code === 'not_available_but_mappable' ) {
				mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for %(cost)s.{{/small}}', {
					args: { domain: lastDomainSearched, cost: this.props.products.domain_map.cost_display },
					components: { a: <a href="#" onClick={ this.addMappingAndRedirect } />, small: <small /> }
				} );
			}

			const domainUnavailableMessage = this.translate( '%(domain)s is taken.', {
				args: { domain: lastDomainSearched }
			} );

			if ( this.props.offerMappingOption ) {
				availabilityElement = (
					<Notice
						className="domain-search-results__domain-availability-copy"
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

	addMappingAndRedirect: function( event ) {
		event.preventDefault();

		if ( this.props.onAddMapping ) {
			return this.props.onAddMapping( this.props.lastDomainSearched );
		}

		upgradesActions.addItem( cartItems.domainMapping( { domain: this.props.lastDomainSearched } ) );

		page( '/checkout/' + this.props.selectedSite.slug );
	},

	onClickResult: function( suggestion ) {
		this.props.onClickResult( suggestion );
	},

	placeholders: function() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainRegistrationSuggestion key={ 'suggestion-' + n } />;
		} );
	},

	suggestions: function() {
		var suggestionElements,
			mappingOffer;

		if ( this.props.suggestions.length ) {
			suggestionElements = this.props.suggestions.map( function( suggestion ) {
				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						buttonLabel={ this.props.buttonLabel }
						cart={ this.props.cart }
						withPlansOnly={ this.props.withPlansOnly }
						onButtonClick={ this.props.onClickResult.bind( null, suggestion ) } />
				);
			}, this );

			if ( this.props.offerMappingOption ) {
				mappingOffer = (
					<DomainMappingSuggestion
						onButtonClick={ this.props.onClickMapping }
						products={ this.props.products }
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
				{ this.suggestions() }
			</div>
		);
	}
} );

module.exports = DomainSearchResults;
