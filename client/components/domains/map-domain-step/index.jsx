/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems,
	Notice = require( 'notices/notice' ),
	{ getFixedDomainSearch, canMap, canRegister } = require( 'lib/domains' ),
	DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainProductPrice = require( 'components/domains/domain-product-price' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	upgradesActions = require( 'lib/upgrades/actions' );

var MapDomainStep = React.createClass( {
	mixins: [ analyticsMixin( 'mapDomain' ) ],

	propTypes: {
		products: React.PropTypes.object.isRequired,
		analyticsSection: React.PropTypes.string.isRequired
	},

	getInitialState: function() {
		return { searchQuery: '' };
	},

	componentWillMount: function() {
		if ( this.props.initialState ) {
			this.setState( this.props.initialState );
		}
	},

	componentWillUnmount: function() {
		this.save();
	},

	notice: function() {
		if ( this.state.notice ) {
			return <Notice text={ this.state.notice } status="is-error" showDismiss={ false } />;
		}
	},

	save: function() {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
	},

	render: function() {
		var price = this.props.products.domain_map ? this.props.products.domain_map.cost_display : null;

		return (
			<div className="map-domain-step">
				{ this.notice() }
				<form className="map-domain-step__form card" onSubmit={ this.handleFormSubmit }>

					<div className="map-domain-step__domain-description">
						<p>
							{ this.translate( 'Map this domain to use it as your site\'s address.', {
								context: 'Upgrades: Description in domain registration',
								comment: "Explains how you could use a new domain name for your site's address."
							} ) }
						</p>
					</div>

					<DomainProductPrice price={ price } cart={ this.props.cart } />

					<fieldset>
						<input
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ this.translate( 'Enter a domain', { textOnly: true } ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus } />
						<button className="map-domain-step__go button is-primary"
								onClick={ this.recordGoButtonClick }>
							{ this.translate( 'Add', {
								context: 'Upgrades: Label for mapping an existing domain'
							} ) }
						</button>
					</fieldset>

					{ this.domainRegistrationUpsell() }
				</form>
			</div>
		);
	},

	domainRegistrationUpsell: function() {
		var suggestion = this.state.suggestion;
		if ( ! suggestion ) {
			return;
		}

		return (
			<div className="domain-search-results__domain-availability is-mapping-suggestion">
				<div className="domain-search-results__domain-availability-copy notice is-success">
					{
						this.translate(
							'%(domain)s is available!',
							{ args: { domain: suggestion.domain_name } }
						)
					}
				</div>
				<DomainRegistrationSuggestion
					suggestion={ suggestion }
					key={ suggestion.domain_name }
					cart={ this.props.cart }
					onButtonClick={ this.registerSuggestedDomain } />
			</div>
		);
	},

	registerSuggestedDomain: function( event ) {
		event.preventDefault();

		this.recordEvent( 'addDomainButtonClick', this.state.suggestion.domain_name, this.props.analyticsSection );

		if ( this.props.onAddDomain ) {
			return this.props.onAddDomain( this.state.suggestion );
		}

		upgradesActions.registerDomain( this.state.suggestion );
	},

	recordInputFocus: function() {
		this.recordEvent( 'inputFocus', this.state.searchQuery );
	},

	recordGoButtonClick: function() {
		this.recordEvent( 'goButtonClick', this.state.searchQuery, this.props.analyticsSection );
	},

	setSearchQuery: function( event ) {
		this.setState( { searchQuery: event.target.value } );
	},

	handleFormSubmit: function( event ) {
		var domain = getFixedDomainSearch( this.state.searchQuery );

		event.preventDefault();
		this.recordEvent( 'formSubmit', this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		canMap( domain, function( error ) {
			if ( error ) {
				this.handleValidationErrorMessage( domain, error );
				return;
			}

			if ( this.props.onAddMapping ) {
				return this.props.onAddMapping( domain, this.state );
			}

			this.addMappingToCart( domain );
		}.bind( this ) );

		canRegister( domain, function( error, result ) {
			if ( error ) {
				return;
			}

			result.domain_name = domain;
			this.setState( { suggestion: result } );
		}.bind( this ) );
	},

	addMappingToCart: function( domain ) {
		upgradesActions.addItem( cartItems.domainMapping( { domain: domain } ) );

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.selectedSite.slug );
		}
	},

	handleValidationErrorMessage: function( domain, error ) {
		let message;

		switch ( error.code ) {
			case 'not_mappable':
				message = this.translate( 'Sorry but %(domain)s has not been registered yet therefore cannot be mapped.', {
					args: { domain: domain }
				} );
				break;

			case 'invalid_domain':
				message = this.translate( 'Sorry but %(domain)s does not appear to be a valid domain name.', {
					args: { domain: domain }
				} );
				break;

			case 'mapped_domain':
				message = this.translate( 'Sorry but %(domain)s is already mapped to a WordPress.com blog.', {
					args: { domain: domain }
				} );
				break;

			case 'restricted_domain':
				message = this.translate( 'Sorry but WordPress.com domains cannot be mapped to a WordPress.com blog.' );

			case 'blacklisted_domain':
				message = this.translate( 'Sorry but %(domain)s cannot be mapped to a WordPress.com blog.', {
					args: { domain: domain }
				} );
				break;

			case 'forbidden_domain':
				message = this.translate( 'Sorry but you do not have the correct permissions to map %(domain)s.', {
					args: { domain: domain }
				} );
				break;

			case 'invalid_tld':
				message = this.translate( 'Sorry but %(domain)s does not end with a valid domain extension.', {
					args: { domain: domain }
				} );
				break;

			case 'empty_query':
				message = this.translate( 'Please enter a domain name or keyword.' );
				break;

			default:
				throw new Error( 'Unrecognized error code: ' + error.code );
		}

		if ( message ) {
			this.setState( { notice: message } );
		}
	}
} );

module.exports = MapDomainStep;
