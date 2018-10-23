/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import AppsBadge from 'me/get-apps/apps-badge';
import Card from 'components/card';
import Button from 'components/button';
import QuerySmsCountries from 'components/data/query-countries/sms';
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';
import FormPhoneInput from 'components/forms/form-phone-input';
import getCountries from 'state/selectors/get-countries';
import { successNotice, errorNotice } from 'state/notices/actions';
import {
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
	isAccountRecoveryPhoneValidated,
} from 'state/account-recovery/settings/selectors';

import { sendSMS } from 'state/mobile-download-sms/actions';

class MobileDownloadCard extends React.Component {
	static displayName = 'SecurityAccountRecoveryRecoveryPhoneEdit';

	static propTypes = {
		translate: PropTypes.func,
		countriesList: PropTypes.array.isRequired,
		storedPhone: PropTypes.shape( {
			countryCode: PropTypes.string,
			countryNumericCode: PropTypes.string,
			number: PropTypes.string,
			numberFull: PropTypes.string,
		} ),
		hasLoadedStoredPhone: PropTypes.bool,
		// onSave: PropTypes.func,
		// onCancel: PropTypes.func,
		// onDelete: PropTypes.func,
	};

	state = {
		phoneNumber: null,
	};

	render() {
		const translate = this.props.translate;
		const hasStoredPhone = ! isEmpty( this.props.storedPhone );
		const hasLoadedStoredPhone = this.props.hasLoadedStoredPhone;

		const phoneNumberIsValid =
			this.state.phoneNumber == null ? hasStoredPhone : this.state.phoneNumberIsValid;

		return (
			<Card className="get-apps__mobile">
				<div className="get-apps__store-subpanel">
					<div className="get-apps__card-text">
						<h3 className="get-apps__card-title">{ translate( 'Mobile Apps' ) }</h3>
						<p className="get-apps__description">
							{ translate( 'WordPress at your fingertips.' ) }
						</p>
					</div>
					<div className="get-apps__badges">
						<AppsBadge
							storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android"
							storeName={ 'android' }
							titleText={ translate( 'Download the WordPress Android mobile app.' ) }
							altText={ translate( 'Google Play Store download badge' ) }
						/>
						<AppsBadge
							storeLink="https://itunes.apple.com/us/app/wordpress/id335703880?mt=8"
							storeName={ 'ios' }
							titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
							altText={ translate( 'Apple App Store download badge' ) }
						/>
					</div>
				</div>
				<div className="get-apps__sms-subpanel">
					<div className="get-apps__sms-field-wrapper">
						{ hasLoadedStoredPhone ? (
							<FormPhoneInput
								countriesList={ this.props.countriesList }
								initialCountryCode={ hasStoredPhone ? this.props.storedPhone.countryCode : null }
								initialPhoneNumber={ hasStoredPhone ? this.props.storedPhone.number : null }
								phoneInputProps={ {
									onKeyUp: this.onKeyUp,
								} }
								onChange={ this.onChange }
							/>
						) : (
							<>
								<QuerySmsCountries />
								<QueryAccountRecoverySettings />

								<FormPhoneInput countriesList={ this.props.countriesList } isDisabled={ true } />
							</>
						) }
					</div>
					<div className="get-apps__sms-button-wrapper">
						<p>{ translate( 'Standard SMS rates may apply' ) }</p>

						<Button
							className="get-apps__sms-button"
							onClick={ this.onSubmit }
							disabled={ ! phoneNumberIsValid }
						>
							{ translate( 'Text me a link' ) }
						</Button>
					</div>
				</div>
			</Card>
		);
	}

	onChange = phoneNumber => {
		this.setState( {
			phoneNumber,
			phoneNumberIsValid: phoneNumber.isValid,
		} );
	};

	onKeyUp = event => {
		if ( event.key === 'Enter' ) {
			this.onSubmit();
		}
	};

	onSubmit = () => {
		const { translate } = this.props;

		const phoneNumber =
			this.state.phoneNumber !== null
				? // The user has typed their own phone number
				  this.state.phoneNumber.phoneNumberFull
				: // The user is sending a message to their stored number
				  this.props.storedPhone.numberFull;

		sendSMS( phoneNumber )
			.then( (/* response */) => {
				successNotice( translate( 'SMS Sent. Go check your messages on your phone!' ) );
			} )
			.catch( (/* error */) => {
				errorNotice( translate( 'There was a problem sending the SMS. Please try again.' ) );
			} );
	};
}

export default connect(
	state => {
		return {
			countriesList: getCountries( state, 'sms' ),
			storedPhone: getAccountRecoveryPhone( state ),
			hasLoadedStoredPhone: isAccountRecoverySettingsReady( state ),
			storedPhoneIsValid: isAccountRecoveryPhoneValidated( state ),
		};
	},
	dispatch => bindActionCreators( { successNotice, errorNotice }, dispatch )
)( localize( MobileDownloadCard ) );
