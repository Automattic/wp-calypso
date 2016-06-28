/**
 * External dependencies
 */
const React = require( 'react' ),
	classNames = require( 'classnames' ),
	page = require( 'page' ),
	times = require( 'lodash/times' ),
	includes = require( 'lodash/includes' ),
	Notice = require( 'components/notice' );

/**
 * Internal dependencies
 */
const DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainMappingSuggestion = require( 'components/domains/domain-mapping-suggestion' ),
	DomainSuggestion = require( 'components/domains/domain-suggestion' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	upgradesActions = require( 'lib/upgrades/actions' ),
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
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					buttonContent={ this.props.buttonContent }
					selectedSite={ this.props.selectedSite }
					cart={ this.props.cart }
					onButtonClick={ this.props.onClickResult.bind( null, availableDomain ) } />
				);
		} else if ( this.props.suggestions && this.props.suggestions.length !== 0 && this.isDomainUnavailable() ) {
			if ( this.props.products.domain_map && this.props.lastDomainError.code === 'not_available_but_mappable' ) {
				const components = { a: <a href="#" onClick={ this.addMappingAndRedirect }/>, small: <small /> };
				if ( this.props.domainsWithPlansOnly ) {
					mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}}' +
						' with WordPress.com Premium.{{/small}}', {
							args: { domain: lastDomainSearched },
							components
						}
					);
				} else {
					if ( isNextDomainFree( this.props.cart ) ) {
						mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for free.{{/small}}', {
							args: {
								domain: lastDomainSearched
							},
							components
						} );
					} else {
						mappingOffer = this.translate( '{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for %(cost)s.{{/small}}', {
							args: {
								domain: lastDomainSearched,
								cost: this.props.products.domain_map.cost_display
							},
							components
						} );
					}
				}
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
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
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
				{ this.suggestions() }
			</div>
		);
	}
} );

module.exports = DomainSearchResults;
