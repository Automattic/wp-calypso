/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems,
	notices = require( 'notices' ),
	{ canRedirect } = require( 'lib/domains' ),
	DomainProductPrice = require( 'components/domains/domain-product-price' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	analyticsMixin = require( 'lib/mixins/analytics' );

var SiteRedirectStep = React.createClass( {
	mixins: [ analyticsMixin( 'siteRedirect' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		products: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState: function() {
		return { searchQuery: '' };
	},

	render: function() {
		var price = this.props.products.offsite_redirect ? this.props.products.offsite_redirect.cost_display : null;

		return (
			<div className="site-redirect-step">
				<form className="site-redirect-step__form card" onSubmit={ this.handleFormSubmit }>

					<div className="site-redirect-step__domain-description">
						<p>
							{ this.translate( 'Redirect {{strong}}%(domain)s{{/strong}} to this domain', {
								components: { strong: <strong /> },
								args: { domain: this.props.selectedSite.slug }
							} ) }
						</p>
					</div>

					<DomainProductPrice
						price={ price }
						requiresPlan={ false } />

					<fieldset>
						<input
							className="site-redirect-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ this.translate( 'Enter a domain', { textOnly: true } ) }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus } />
						<button className="site-redirect-step__go button is-primary"
								onClick={ this.recordGoButtonClick }>
							{ this.translate( 'Go', {
								context: 'Upgrades: Label for adding Site Redirect'
							} ) }
						</button>
					</fieldset>
				</form>
			</div>
		);
	},

	recordInputFocus: function() {
		this.recordEvent( 'inputFocus', this.state.searchQuery );
	},

	recordGoButtonClick: function() {
		this.recordEvent( 'goButtonClick', this.state.searchQuery );
	},

	setSearchQuery: function( event ) {
		this.setState( { searchQuery: event.target.value } );
	},

	handleFormSubmit: function( event ) {
		var domain;

		event.preventDefault();
		this.recordEvent( 'formSubmit', this.state.searchQuery );
		domain = this.state.searchQuery;

		if ( cartItems.hasProduct( this.props.cart, 'offsite_redirect' ) ) {
			notices.error( this.getValidationErrorMessage( domain, { code: 'already_in_cart' } ) );
			return;
		}

		canRedirect( this.props.selectedSite.ID, domain, function( error ) {
			if ( error ) {
				notices.error( this.getValidationErrorMessage( domain, error ) );
				return;
			}

			this.addSiteRedirectToCart( domain );
		}.bind( this ) );
	},

	addSiteRedirectToCart: function( domain ) {
		upgradesActions.addItem( cartItems.siteRedirect( { domain: domain } ) );

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.selectedSite.slug );
		}
	},

	getValidationErrorMessage: function( domain, error ) {
		switch ( error.code ) {
			case 'invalid_domain':
				return this.translate( 'Sorry but %(domain)s does not appear to be a valid domain name.', {
					args: { domain: domain }
				} );

			case 'invalid_tld':
				return this.translate( 'Sorry but %(domain)s does not end with a valid domain extension.', {
					args: { domain: domain }
				} );

			case 'empty_query':
				return this.translate( 'Please enter a domain name or keyword.' );

			case 'has_subscription':
				return this.translate( "You already have Site Redirect upgrade and can't add another one to the same site." );

			case 'already_in_cart':
				return this.translate( "You already have Site Redirect upgrade in the Shopping Cart and can't add another one" );

			default:
				return this.translate( 'There is a problem adding Site Redirect that points to %(domain)s.', {
					args: { domain: domain }
				} );
		}
	}
} );

module.exports = SiteRedirectStep;
