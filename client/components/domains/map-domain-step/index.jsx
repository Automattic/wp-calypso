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
import { getDomainPriceRule } from 'lib/cart-values/cart-items';
import { getFixedDomainSearch, getTld, checkDomainAvailability } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainProductPrice from 'components/domains/domain-product-price';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { MAP_EXISTING_DOMAIN, INCOMING_DOMAIN_TRANSFER } from 'lib/url/support';
import FormTextInput from 'components/forms/form-text-input';
import {
	recordAddDomainButtonClickInMapDomain,
	recordFormSubmitInMapDomain,
	recordInputFocusInMapDomain,
	recordGoButtonClickInMapDomain,
} from 'state/domains/actions';
import Notice from 'components/notice';

/**
 * Style dependencies
 */
import './style.scss';

class MapDomainStep extends React.Component {
	static propTypes = {
		products: PropTypes.object,
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
		initialQuery: '',
	};

	state = {
		...this.props.initialState,
		searchQuery: this.props.initialQuery,
	};

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
		const suggestion = get( this.props, 'products.domain_map', false )
			? {
					cost: this.props.products.domain_map.cost_display,
					product_slug: this.props.products.domain_map.product_slug,
			  }
			: { cost: null, product_slug: '' };
		const { searchQuery } = this.state;
		const { translate } = this.props;

		return (
			<div className="map-domain-step">
				{ this.notice() }
				<form className="map-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="map-domain-step__domain-heading">
						{ translate( 'Map this domain to use it as your site address.', {
							context: 'Upgrades: Description in domain registration',
							comment: 'Explains how you could use a new domain name for your site address.',
						} ) }
					</div>

					<DomainProductPrice
						rule={ getDomainPriceRule(
							this.props.domainsWithPlansOnly,
							this.props.selectedSite,
							this.props.cart,
							suggestion,
							false
						) }
						price={ suggestion.cost }
						isMappingProduct={ true }
					/>

					<div className="map-domain-step__add-domain" role="group">
						<FormTextInput
							className="map-domain-step__external-domain"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'example.com' ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						/>
						<button
							disabled={ ! getTld( searchQuery ) }
							className="map-domain-step__go button is-primary"
							onClick={ this.recordGoButtonClick }
						>
							{ translate( 'Add', {
								context: 'Upgrades: Label for mapping an existing domain',
							} ) }
						</button>
					</div>

					{ this.domainRegistrationUpsell() }

					<div className="map-domain-step__domain-text">
						{ translate(
							"We'll add your domain and help you change its settings so it points to your site. Keep your domain renewed with your current provider. (They'll remind you when it's time.) {{a}}Learn more about mapping a domain{{/a}}.",
							{
								components: {
									a: <a href={ MAP_EXISTING_DOMAIN } rel="noopener noreferrer" target="_blank" />,
								},
							}
						) }
					</div>
					<div className="map-domain-step__domain-text">
						{ translate(
							"You can transfer your domain's registration to WordPress.com and renew your domain and site from the same place. {{a}}Learn more about domain transfers{{/a}}.",
							{
								components: {
									a: (
										<a
											href={ INCOMING_DOMAIN_TRANSFER }
											rel="noopener noreferrer"
											target="_blank"
										/>
									),
								},
							}
						) }
					</div>
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
			<div className="map-domain-step__domain-availability">
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

	setSearchQuery = ( event ) => {
		this.setState( { searchQuery: event.target.value } );
	};

	handleFormSubmit = ( event ) => {
		event.preventDefault();

		const domain = getFixedDomainSearch( this.state.searchQuery );
		this.props.recordFormSubmitInMapDomain( this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		checkDomainAvailability(
			{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
			( error, result ) => {
				const mappableStatus = get( result, 'mappable', error );
				const status = get( result, 'status', error );
				const {
					AVAILABLE,
					AVAILABILITY_CHECK_ERROR,
					MAPPABLE,
					MAPPED,
					NOT_REGISTRABLE,
					UNKNOWN,
				} = domainAvailability;

				if ( status === AVAILABLE ) {
					this.setState( { suggestion: result } );
					return;
				}

				if (
					! includes( [ AVAILABILITY_CHECK_ERROR, NOT_REGISTRABLE ], status ) &&
					includes( [ MAPPABLE, UNKNOWN ], mappableStatus )
				) {
					this.props.onMapDomain( domain );
					return;
				}

				let site = get( result, 'other_site_domain', null );
				if ( ! site ) {
					site = get( this.props, 'selectedSite.slug', null );
				}

				const availabilityStatus = MAPPED === mappableStatus ? mappableStatus : status;

				const maintenanceEndTime = get( result, 'maintenance_end_time', null );
				const { message, severity } = getAvailabilityNotice( domain, availabilityStatus, {
					site,
					maintenanceEndTime,
				} );
				this.setState( { notice: message, noticeSeverity: severity } );
			}
		);
	};
}

export default connect(
	( state ) => ( {
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
