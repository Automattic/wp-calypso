/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { getFixedDomainSearch, canMap, canRegister, getTld } from 'lib/domains';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainProductPrice from 'components/domains/domain-product-price';
import analyticsMixin from 'lib/mixins/analytics';
import { getCurrentUser } from 'state/current-user/selectors';
import support from 'lib/url/support';
import Notice from 'components/notice';

const MapDomainStep = React.createClass( {
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
			price = this.props.products.domain_map ? this.props.products.domain_map.cost_display : null,
			translate = this.props.translate;

		return (
			<div className="map-domain-step">
				{ this.notice() }
				<form className="map-domain-step__form card" onSubmit={ this.handleFormSubmit }>

					<div className="map-domain-step__domain-description">
						<p>
							{ translate( 'Map this domain to use it as your site\'s address.', {
								context: 'Upgrades: Description in domain registration',
								comment: "Explains how you could use a new domain name for your site's address."
							} ) }
						</p>
					</div>

					<DomainProductPrice
						rule={ cartItems.getDomainPriceRule(
							this.props.domainsWithPlansOnly,
							this.props.selectedSite,
							this.props.cart, suggestion
						) }
						price={ price } />

					<div className="map-domain-step__add-domain" role="group">
						<input
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'Enter a domain', { textOnly: true } ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus />
						<button className="map-domain-step__go button is-primary"
								onClick={ this.recordGoButtonClick }>
							{ translate( 'Add', {
								context: 'Upgrades: Label for mapping an existing domain'
							} ) }
						</button>
					</div>

					{ this.domainRegistrationUpsell() }
				</form>
			</div>
		);
	},

	domainRegistrationUpsell: function() {
		const suggestion = this.state.suggestion;
		if ( ! suggestion ) {
			return;
		}

		return (
			<div className="domain-search-results__domain-availability is-mapping-suggestion">
				<Notice
					status="is-success"
					showDismiss={ false }>
					{
						this.props.translate(
							'%(domain)s is available!',
							{ args: { domain: suggestion.domain_name } }
						)
					}
				</Notice>
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
		const domain = getFixedDomainSearch( this.state.searchQuery );

		event.preventDefault();
		this.recordEvent( 'formSubmit', this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

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
		let message;
		const severity = 'error',
			tld = getTld( domain ),
			translate = this.props.translate;

		switch ( error.code ) {
			case 'tld_in_maintenance':
				if ( tld ) {
					message = translate( 'Sorry, .%(tld)s TLD is in maintenance, and we cannot check availability for it.', {
						args: { tld }
					} );
				}
				break;

			case 'not_mappable':
				message = translate( 'Sorry, %(domain)s has not been registered yet therefore cannot be mapped.', {
					args: { domain }
				} );
				break;

			case 'invalid_domain':
				message = translate( 'Sorry, %(domain)s does not appear to be a valid domain name.', {
					args: { domain }
				} );
				break;

			case 'mapped_domain':
				message = translate( 'Sorry, %(domain)s is already mapped to a WordPress.com blog.', {
					args: { domain }
				} );
				break;

			case 'restricted_domain':
				message = translate( 'Sorry, WordPress.com domains cannot be mapped to a WordPress.com blog.' );
				break;

			case 'blacklisted_domain':
				if ( domain.toLowerCase().indexOf( 'wordpress' ) > -1 ) {
					message = translate(
						'Due to {{a1}}trademark policy{{/a1}}, we are not able to allow domains containing ' +
						'{{strong}}WordPress{{/strong}} to be registered or mapped here. ' +
						'Please {{a2}}contact support{{/a2}} if you have any questions.',
						{
							components: {
								strong: <strong />,
								a1: <a target="_blank" rel="noopener noreferrer" href="http://wordpressfoundation.org/trademark-policy/" />,
								a2: <a href={ support.CALYPSO_CONTACT } />
							}
						}
					);
				} else {
					message = translate( 'Sorry, %(domain)s cannot be mapped to a WordPress.com blog.', {
						args: { domain }
					} );
				}
				break;

			case 'forbidden_domain':
				message = translate( 'Only the owner of the domain can map its subdomains.' );
				break;

			case 'invalid_tld':
				message = translate( 'Sorry, %(domain)s does not end with a valid domain extension.', {
					args: { domain }
				} );
				break;

			case 'empty_query':
				message = translate( 'Please enter a domain name or keyword.' );
				break;

			default:
				message = translate( 'Sorry, there was a problem processing your request. Please try again in a few minutes.' );
		}

		if ( message ) {
			this.setState( { notice: message, noticeSeverity: severity } );
		}
	}
} );

module.exports = connect( state => ( { currentUser: getCurrentUser( state ) } ) )( localize( MapDomainStep ) );
