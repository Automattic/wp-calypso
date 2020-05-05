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
import { bumpStat } from 'woocommerce/lib/analytics';
import { errorNotice } from 'state/notices/actions';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import {
	areLocationsLoaded,
	getAllCountries,
	getCountriesWithStates,
} from 'woocommerce/state/sites/data/locations/selectors';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { setSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './footer';
import SetupHeader from './header';
import SetupNotices from './notices';
import { doInitialSetup } from 'woocommerce/state/sites/settings/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryLocations from 'woocommerce/components/query-locations';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import userFactory from 'lib/user';
import VerifyEmailDialog from 'components/email-verification/email-verification-dialog';

const user = userFactory();

class StoreLocationSetupView extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			address: {},
			isFetchingUser: false,
			isSaving: false,
			showEmailVerificationDialog: false,
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
		adminURL: PropTypes.string.isRequired,
		countries: PropTypes.arrayOf(
			PropTypes.shape( {
				code: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				states: PropTypes.arrayOf(
					PropTypes.shape( {
						code: PropTypes.string.isRequired,
						name: PropTypes.string.isRequired,
					} )
				),
			} )
		),
		onRequestRedirect: PropTypes.func.isRequired,
		pushDefaultsForCountry: PropTypes.bool.isRequired,
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

	UNSAFE_componentWillReceiveProps = ( newProps ) => {
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

				// If settings general has an address, use it
				// Otherwise, if the contact details has an address, use it
				if ( ! isEmpty( storeLocation.street ) ) {
					address = pick( storeLocation, keys( address ) );
				} else if ( ! isEmpty( contactDetails.address1 ) ) {
					address = this.getAddressFromContactDetails( contactDetails );
				}

				this.setState( { address } );
			}
		}
	};

	getAddressFromContactDetails = ( contactDetails ) => {
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

	onChange = ( event ) => {
		const addressKey = event.target.name;
		const newValue = event.target.value;

		const address = this.state.address;
		address[ addressKey ] = newValue;

		// Users of AddressView isEditable must always update the state prop
		// passed to AddressView in the event of country changes
		if ( 'country' === addressKey ) {
			const countryData = find( this.props.countries, { code: newValue } );
			if ( ! isEmpty( countryData.states ) ) {
				address.state = countryData.states[ 0 ].code;
			} else {
				address.state = '';
			}
		}

		this.setState( { address, userBeganEditing: true } );
	};

	onNext = ( event ) => {
		const {
			countries,
			currentUserEmailVerified,
			pushDefaultsForCountry,
			siteId,
			translate,
		} = this.props;
		event.preventDefault();

		// Already saving? Bail.
		if ( this.state.isSaving ) {
			return;
		}

		if ( ! currentUserEmailVerified ) {
			this.setState( { showEmailVerificationDialog: true } );
			return;
		}

		this.setState( { isSaving: true } );

		// TODO before attempting to set the address, make sure all required
		// plugins are installed and activated

		const onSuccess = () => {
			// No need to set isSaving to false here - we're navigating away from here
			// and setting isSaving to false will just light the button up again right
			// before the next step's dialog displays

			// mc stat 32 char max :P
			this.props.bumpStat( 'calypso_woo_store_setup_country', this.state.address.country );

			return setSetStoreAddressDuringInitialSetup( siteId, true );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice(
				translate( 'There was a problem saving the store address. Please try again.' )
			);
		};

		let settings = {};

		// If we have been asked to push appropriate defaults for the country
		// (e.g. if there are no products yet on the site) then use locale
		// info (if any) to do so
		if ( pushDefaultsForCountry ) {
			const localeInfo = find( countries, { code: this.state.address.country } );
			if ( ! isEmpty( localeInfo ) ) {
				settings = localeInfo;
			}
		}

		this.props.doInitialSetup(
			siteId,
			this.state.address.street,
			this.state.address.street2,
			this.state.address.city,
			this.state.address.state,
			this.state.address.postcode,
			this.state.address.country,
			settings,
			onSuccess,
			onFailure
		);
	};

	renderForm = () => {
		const {
			contactDetails,
			countries,
			countriesWithStates,
			locationsLoaded,
			settingsGeneralLoaded,
			translate,
		} = this.props;
		const showForm =
			contactDetails && settingsGeneralLoaded && locationsLoaded && ! this.state.isFetchingUser;

		// Note: We will have to revisit this if/when we support countries that lack post codes
		const requiredKeys = [ 'country', 'city', 'postcode', 'street' ];

		// See if this country has states
		if ( includes( countriesWithStates, this.state.address.country ) ) {
			requiredKeys.push( 'state' );
		}

		const requiredAddressFields = pick( this.state.address, requiredKeys );
		const everyRequiredFieldHasAValue = every( requiredAddressFields, ( field ) => {
			return ! isEmpty( trim( field ) );
		} );
		const submitDisabled = this.state.isSaving || ! everyRequiredFieldHasAValue;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		if ( ! showForm ) {
			return (
				<div className="dashboard__placeholder">
					<div className="dashboard__placeholder-large card dashboard-widget" />
				</div>
			);
		}
		/* eslint-enable wpcalypso/jsx-classname-namespace */

		return (
			<div>
				<AddressView
					address={ this.state.address }
					countries={ countries }
					isEditable
					onChange={ this.onChange }
				/>
				<SetupFooter
					busy={ this.state.isSaving }
					disabled={ submitDisabled }
					onClick={ this.onNext }
					label={ translate( 'Next', { context: 'Label for button that submits a form' } ) }
					primary
				/>
			</div>
		);
	};

	closeVerifyEmailDialog = () => {
		this.setState( { showEmailVerificationDialog: false } );
		// Re-fetch the user to see if they actually took care of things
		user.fetch();
		this.setState( { isFetchingUser: true } );
		user.once( 'change', () => this.setState( { isFetchingUser: false } ) );
	};

	render = () => {
		const { siteId, translate } = this.props;

		return (
			<div className="setup__wrapper">
				<SetupNotices />
				{ this.state.showEmailVerificationDialog && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<div className="setup__location card">
					<SetupHeader
						imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
						imageWidth={ 160 }
						title={ translate( 'Howdy! Ready to start selling?' ) }
						subtitle={ translate( 'First we need to know where you are in the world.' ) }
					/>
					{ this.renderForm() }
					<QueryLocations siteId={ siteId } />
					<QuerySettingsGeneral siteId={ siteId } />
					<QueryContactDetailsCache />
				</div>
			</div>
		);
	};
}

function mapStateToProps( state, ownProps ) {
	const { siteId } = ownProps;
	const contactDetails = getContactDetailsCache( state );
	const currentUserEmailVerified = isCurrentUserEmailVerified( state );
	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );
	const locationsLoaded = areLocationsLoaded( state, siteId );
	const countries = getAllCountries( state, siteId );
	const countriesWithStates = getCountriesWithStates( state, siteId );

	return {
		contactDetails,
		countries,
		countriesWithStates,
		currentUserEmailVerified,
		locationsLoaded,
		settingsGeneralLoaded,
		storeLocation,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			bumpStat,
			doInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreLocationSetupView ) );
