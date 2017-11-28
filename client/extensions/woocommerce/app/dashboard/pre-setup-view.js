/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every, find, includes, isEmpty, keys, pick, trim } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import BasicWidget from 'woocommerce/components/basic-widget';
import { errorNotice } from 'state/notices/actions';
import { getContactDetailsCache } from 'state/selectors';
import { getCountryData, getCountries } from 'woocommerce/lib/countries';
import { setSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';
import { doInitialSetup } from 'woocommerce/state/sites/settings/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class PreSetupView extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			address: {},
			isSaving: false,
			userBeganEditing: false,
		};
	}

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		contactDetails: PropTypes.shape( {
			address1: PropTypes.string,
			address2: PropTypes.string,
			city: PropTypes.string,
			state: PropTypes.string,
			postalCode: PropTypes.string,
			countryCode: PropTypes.string,
		} ),
		settingsGeneralLoaded: PropTypes.bool,
		storeLocation: PropTypes.shape( {
			street: PropTypes.string,
			street2: PropTypes.string,
			city: PropTypes.string,
			state: PropTypes.string,
			postcode: PropTypes.string,
			country: PropTypes.string,
		} ),
	};

	componentWillReceiveProps = newProps => {
		const { contactDetails, storeLocation } = newProps;

		if ( ! this.state.userBeganEditing ) {
			// Once store address (if any) from settings general and contact details have arrived
			if ( contactDetails && storeLocation ) {
				let address = {
					street: '',
					street2: '',
					city: '',
					state: 'AL',
					postcode: '',
					country: 'US',
				};
				// If the settings general country is US or CA and it has a street address, use it
				// Otherwise, if the contact details country is US or CA and it has a street address, use it
				if (
					includes( [ 'US', 'CA' ], storeLocation.country ) &&
					! isEmpty( storeLocation.street )
				) {
					address = pick( storeLocation, keys( address ) );
				} else if (
					includes( [ 'US', 'CA' ], contactDetails.countryCode ) &&
					! isEmpty( contactDetails.address1 )
				) {
					address = this.getAddressFromContactDetails( contactDetails );
				}
				this.setState( { address } );
			}
		}
	};

	getAddressFromContactDetails = contactDetails => {
		const { address1, address2, city, state, postalCode, countryCode } = contactDetails;
		return {
			street: address1 || '',
			street2: address2 || '',
			city: city || '',
			state: state || 'AL',
			postcode: postalCode || '',
			country: countryCode || 'US',
		};
	};

	onChange = event => {
		const addressKey = event.target.name;
		const newValue = event.target.value;

		const address = this.state.address;
		address[ addressKey ] = newValue;

		// Did they change the country? Force an appropriate state default
		if ( 'country' === addressKey ) {
			const countryData = getCountryData( newValue );
			address.state = countryData ? countryData.defaultState : '';
		}

		this.setState( { address, userBeganEditing: true } );
	};

	onNext = event => {
		const { siteId, translate } = this.props;
		event.preventDefault();
		this.setState( { isSaving: true } );

		// TODO before attempting to set the address, make sure all required
		// plugins are installed and activated

		const onSuccess = () => {
			// No need to set isSaving to false here - we're navigating away from here
			// and setting isSaving to false will just light the button up again right
			// before the next step's dialog displays
			return setSetStoreAddressDuringInitialSetup( siteId, true );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice(
				translate( 'There was a problem saving the store address. Please try again.' )
			);
		};

		// Provides fallbacks if the country & state options were never changed/toggled,
		// or if an unsupported country was set in state (like WC's default GB country)
		let country = null;
		let state = null;
		if (
			! this.state.address.country ||
			! find( getCountries(), { code: this.state.address.country } )
		) {
			country = 'US';
			const countryData = getCountryData( country );
			state = this.state.address.state ? this.state.address.state : countryData.defaultState;
		} else {
			country = this.state.address.country;
			state = this.state.address.state;
		}

		this.props.doInitialSetup(
			siteId,
			this.state.address.street,
			this.state.address.street2,
			this.state.address.city,
			state,
			this.state.address.postcode,
			country,
			onSuccess,
			onFailure
		);
	};

	renderForm = () => {
		const { contactDetails, settingsGeneralLoaded, translate } = this.props;
		const showForm = contactDetails && settingsGeneralLoaded;

		// Note: We will have to revisit this if/when we support countries that lack post codes
		const requiredAddressFields = pick( this.state.address, [ 'street', 'city', 'postcode' ] );
		const everyRequiredFieldHasAValue = every( requiredAddressFields, field => {
			return ! isEmpty( trim( field ) );
		} );
		const submitDisabled = this.state.isSaving || ! everyRequiredFieldHasAValue;

		if ( ! showForm ) {
			return (
				<div className="dashboard__placeholder">
					<BasicWidget className="dashboard__placeholder-large card" />
				</div>
			);
		}

		return (
			<div>
				<AddressView
					address={ this.state.address }
					className="dashboard__pre-setup-address"
					isEditable
					onChange={ this.onChange }
				/>
				<SetupFooter
					disabled={ submitDisabled }
					onClick={ this.onNext }
					label={ translate( "Let's Go!" ) }
					primary
				/>
			</div>
		);
	};

	render = () => {
		const { siteId, translate } = this.props;

		return (
			<div className="card dashboard__setup-wrapper dashboard__location">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Howdy! Ready to start selling?' ) }
					subtitle={ translate( 'First we need to know where you are in the world.' ) }
				/>
				{ this.renderForm() }
				<QuerySettingsGeneral siteId={ siteId } />
				<QueryContactDetailsCache />
			</div>
		);
	};
}

function mapStateToProps( state, ownProps ) {
	const { siteId } = ownProps;

	const contactDetails = getContactDetailsCache( state );
	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );

	return {
		contactDetails,
		settingsGeneralLoaded,
		storeLocation,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			doInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PreSetupView ) );
