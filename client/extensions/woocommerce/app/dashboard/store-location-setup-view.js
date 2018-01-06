/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every, isEmpty, keys, pick, trim } from 'lodash';
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
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { isStoreManagementSupportedInCalypsoForCountry } from 'woocommerce/lib/countries';
import { setSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';
import SetupNotices from './setup-notices';
import { doInitialSetup } from 'woocommerce/state/sites/settings/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
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

		this.setState( { address, userBeganEditing: true } );
	};

	onNext = event => {
		const { adminURL, currentUserEmailVerified, onRequestRedirect, siteId, translate } = this.props;
		event.preventDefault();

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

			// If we don't support a calypso experience yet for this country, let
			// them complete setup with the wp-admin WooCommerce wizard
			if ( ! isStoreManagementSupportedInCalypsoForCountry( this.state.address.country ) ) {
				const storeSetupURL =
					adminURL + 'admin.php?page=wc-setup&step=store_setup&activate_error=false&from=calypso';
				onRequestRedirect( storeSetupURL );
			}

			return setSetStoreAddressDuringInitialSetup( siteId, true );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice(
				translate( 'There was a problem saving the store address. Please try again.' )
			);
		};

		this.props.doInitialSetup(
			siteId,
			this.state.address.street,
			this.state.address.street2,
			this.state.address.city,
			this.state.address.state,
			this.state.address.postcode,
			this.state.address.country,
			this.props.pushDefaultsForCountry,
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
		const submitDisabled =
			this.state.isSaving || this.state.isFetchingUser || ! everyRequiredFieldHasAValue;

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
					showAllLocations
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
			<div className="dashboard__setup-wrapper">
				<SetupNotices />
				{ this.state.showEmailVerificationDialog && (
					<VerifyEmailDialog onClose={ this.closeVerifyEmailDialog } />
				) }
				<div className="card dashboard__location">
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

	return {
		contactDetails,
		currentUserEmailVerified,
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( StoreLocationSetupView ) );
