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
import { getFixedDomainSearch, checkDomainAvailability } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainProductPrice from 'components/domains/domain-product-price';
import analyticsMixin from 'lib/mixins/analytics';
import { getCurrentUser } from 'state/current-user/selectors';
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
		const suggestion = this.props.products.domain_map
				? { cost: this.props.products.domain_map.cost_display, product_slug: this.props.products.domain_map.product_slug }
				: { cost: null, product_slug: '' },
			{ translate } = this.props;

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
							this.props.cart,
							suggestion
						) }
						price={ suggestion.cost } />

					<div className="map-domain-step__add-domain" role="group">
						<input
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'Enter a domain' ) }
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
		const { suggestion } = this.state;
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
		event.preventDefault();

		const domain = getFixedDomainSearch( this.state.searchQuery );
		this.recordEvent( 'formSubmit', this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		checkDomainAvailability( domain, ( error, result ) => {
			const status = result && result.status ? result.status : error;
			switch ( status ) {
				case domainAvailability.MAPPABLE:
				case domainAvailability.UNKNOWN:
					this.props.onMapDomain( domain );
					return;

				case domainAvailability.AVAILABLE:
					this.setState( { suggestion: result } );
					return;

				default:
					const { message, severity } = getAvailabilityNotice( domain, status );
					this.setState( { notice: message, noticeSeverity: severity } );
					return;
			}
		} );
	},
} );

module.exports = connect( state => ( { currentUser: getCurrentUser( state ) } ) )( localize( MapDomainStep ) );
