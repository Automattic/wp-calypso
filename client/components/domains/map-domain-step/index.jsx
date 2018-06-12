/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes, noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { getFixedDomainSearch, checkDomainAvailability } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainProductPrice from 'components/domains/domain-product-price';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	recordAddDomainButtonClickInMapDomain,
	recordFormSubmitInMapDomain,
	recordInputFocusInMapDomain,
	recordGoButtonClickInMapDomain,
} from 'state/domains/actions';
import Notice from 'components/notice';

class MapDomainStep extends React.Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		initialQuery: PropTypes.string,
		analyticsSection: PropTypes.string.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		onRegisterDomain: PropTypes.func.isRequired,
		onMapDomain: PropTypes.func.isRequired,
		onSave: PropTypes.func,
	};

	static defaultProps = {
		onSave: noop,
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			searchQuery: this.props.initialQuery,
		};
	}

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( Object.assign( {}, this.props.initialState, this.getDefaultState() ) );
		}
	}

	componentWillUnmount() {
		this.props.onSave( this.state );
	}

	notice() {
		if ( this.state.notice ) {
			return (
				<Notice
					text={ this.state.notice }
					status={ `is-${ this.state.noticeSeverity }` }
					showDismiss={ false }
				/>
			);
		}
	}

	render() {
		const suggestion = this.props.products.domain_map
			? {
					cost: this.props.products.domain_map.cost_display,
					product_slug: this.props.products.domain_map.product_slug,
			  }
			: { cost: null, product_slug: '' };
		const { translate } = this.props;

		return (
			<div className="map-domain-step">
				{ this.notice() }
				<form className="map-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="map-domain-step__domain-description">
						<p>
							{ translate( "Map this domain to use it as your site's address.", {
								context: 'Upgrades: Description in domain registration',
								comment: "Explains how you could use a new domain name for your site's address.",
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
						price={ suggestion.cost }
					/>

					<div className="map-domain-step__add-domain" role="group">
						<input
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'Enter a domain' ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus
						/>
						<button
							className="map-domain-step__go button is-primary"
							onClick={ this.recordGoButtonClick }
						>
							{ translate( 'Add', {
								context: 'Upgrades: Label for mapping an existing domain',
							} ) }
						</button>
					</div>

					{ this.domainRegistrationUpsell() }
				</form>
			</div>
		);
	}

	domainRegistrationUpsell() {
		const { suggestion } = this.state;
		if ( ! suggestion ) {
			return;
		}

		return (
			<div className="domain-search-results__domain-availability is-mapping-suggestion">
				<Notice status="is-success" showDismiss={ false }>
					{ this.props.translate( '%(domain)s is available!', {
						args: { domain: suggestion.domain_name },
					} ) }
				</Notice>
				<DomainRegistrationSuggestion
					suggestion={ suggestion }
					selectedSite={ this.props.selectedSite }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					key={ suggestion.domain_name }
					cart={ this.props.cart }
					onButtonClick={ this.registerSuggestedDomain }
				/>
			</div>
		);
	}

	registerSuggestedDomain = () => {
		this.props.recordAddDomainButtonClickInMapDomain(
			this.state.suggestion.domain_name,
			this.props.analyticsSection
		);

		return this.props.onRegisterDomain( this.state.suggestion );
	};

	recordInputFocus = () => {
		this.props.recordInputFocusInMapDomain( this.state.searchQuery );
	};

	recordGoButtonClick = () => {
		this.props.recordGoButtonClickInMapDomain(
			this.state.searchQuery,
			this.props.analyticsSection
		);
	};

	setSearchQuery = event => {
		this.setState( { searchQuery: event.target.value } );
	};

	handleFormSubmit = event => {
		event.preventDefault();

		const domain = getFixedDomainSearch( this.state.searchQuery );
		this.props.recordFormSubmitInMapDomain( this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		checkDomainAvailability(
			{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
			( error, result ) => {
				const mappableStatus = get( result, 'mappable', error );
				const status = get( result, 'status', error );
				const { AVAILABLE, MAPPABLE, NOT_REGISTRABLE, UNKNOWN } = domainAvailability;

				if ( status === AVAILABLE ) {
					this.setState( { suggestion: result } );
					return;
				}

				if ( status !== NOT_REGISTRABLE && includes( [ MAPPABLE, UNKNOWN ], mappableStatus ) ) {
					this.props.onMapDomain( domain );
					return;
				}

				let site = get( result, 'other_site_domain', null );
				if ( ! site ) {
					site = get( this.props, 'selectedSite.slug', null );
				}

				const maintenanceEndTime = get( result, 'maintenance_end_time', null );
				const { message, severity } = getAvailabilityNotice( domain, status, {
					site,
					maintenanceEndTime,
				} );
				this.setState( { notice: message, noticeSeverity: severity } );
			}
		);
	};
}

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		selectedSite: getSelectedSite( state ),
	} ),
	{
		recordAddDomainButtonClickInMapDomain,
		recordFormSubmitInMapDomain,
		recordInputFocusInMapDomain,
		recordGoButtonClickInMapDomain,
	}
)( localize( MapDomainStep ) );
