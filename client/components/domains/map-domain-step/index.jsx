/**
 * External dependencies
 */
var React = require( 'react' ),
	endsWith = require( 'lodash/endsWith' ),
	{ connect } = require( 'react-redux' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems,
	Notice = require( 'components/notice' ),
	{ getFixedDomainSearch, canMap, canRegister } = require( 'lib/domains' ),
	DomainRegistrationSuggestion = require( 'components/domains/domain-registration-suggestion' ),
	DomainProductPrice = require( 'components/domains/domain-product-price' ),
	analyticsMixin = require( 'lib/mixins/analytics' ),
	{ getCurrentUser } = require( 'state/current-user/selectors' ),
	support = require( 'lib/url/support' );

var MapDomainStep = React.createClass( {
	mixins: [ analyticsMixin( 'mapDomain' ) ],

	propTypes: {
		products: React.PropTypes.object.isRequired,
		cart: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.bool ] ),
		initialQuery: React.PropTypes.string,
		analyticsSection: React.PropTypes.string.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		onRegisterDomain: React.PropTypes.func.isRequired,
		onMapDomain: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		return { searchQuery: this.props.initialQuery };
	},

	componentWillMount: function() {
		if ( this.props.initialState ) {
			this.setState( Object.assign( {}, this.props.initialState, this.getInitialState() ) );
		}
	},

	componentWillUnmount: function() {
		this.save();
	},

	notice: function() {
		if ( this.state.notice ) {
			return <Notice text={ this.state.notice } status={ `is-${ this.state.noticeSeverity }` } showDismiss={ false } />;
		}
	},

	save: function() {
		if ( this.props.onSave ) {
			this.props.onSave( this.state );
		}
	},

	render: function() {
		const suggestion = { cost: this.props.products.domain_map.cost_display, product_slug: this.props.products.domain_map.product_slug },
			price = this.props.products.domain_map ? this.props.products.domain_map.cost_display : null;

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

					<DomainProductPrice
						rule={ cartItems.getDomainPriceRule( this.props.domainsWithPlansOnly, this.props.selectedSite, this.props.cart, suggestion ) }
						price={ price } />

					<fieldset>
						<input
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ this.translate( 'Enter a domain', { textOnly: true } ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus />
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
					selectedSite={ this.props.selectedSite }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					key={ suggestion.domain_name }
					cart={ this.props.cart }
					onButtonClick={ this.registerSuggestedDomain } />
			</div>
		);
	},

	registerSuggestedDomain: function( event ) {
		event.preventDefault();

		this.recordEvent( 'addDomainButtonClick', this.state.suggestion.domain_name, this.props.analyticsSection );

		return this.props.onRegisterDomain( this.state.suggestion );
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

		if ( endsWith( domain, '.blog' ) ) {
			return this.handleValidationErrorMessage( domain, { code: 'dotblog_domain' } );
		}

		canMap( domain, error => {
			if ( error ) {
				this.handleValidationErrorMessage( domain, error );
				return;
			}

			return this.props.onMapDomain( domain );
		} );

		canRegister( domain, ( error, result ) => {
			if ( error ) {
				return;
			}

			result.domain_name = domain;
			this.setState( { suggestion: result } );
		} );
	},

	handleValidationErrorMessage: function( domain, error ) {
		let message,
			severity = 'error';

		switch ( error.code ) {
			case 'dotblog_domain':
				message = this.translate(
					'.blog domains are not available yet. {{a}}Sign up{{/a}} to get updates on the launch.', {
						components: {
							a: <a
								target="_blank"
								href={ `https://dotblog.wordpress.com/
								?email=${ this.props.currentUser && encodeURIComponent( this.props.currentUser.email ) || '' }
								&domain=${ domain }` }/>
						}
					} );
				severity = 'info';
				break;
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
				break;

			case 'blacklisted_domain':
				if ( domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
					message = this.translate(
						'Due to {{a1}}trademark policy{{/a1}}, we are not able to allow domains containing {{strong}}WordPress{{/strong}} to be registered or mapped here. Please {{a2}}contact support{{/a2}} if you have any questions.',
						{
							components: {
								strong: <strong />,
								a1: <a target="_blank" href="http://wordpressfoundation.org/trademark-policy/"/>,
								a2: <a href={ support.CALYPSO_CONTACT }/>
							}
						}
					);
				} else {
					message = this.translate( 'Sorry but %(domain)s cannot be mapped to a WordPress.com blog.', {
						args: { domain: domain }
					} );
				}
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
			this.setState( { notice: message, noticeSeverity: severity } );
		}
	}
} );

module.exports = connect( state => ( { currentUser: getCurrentUser( state ) } ) )( MapDomainStep );
