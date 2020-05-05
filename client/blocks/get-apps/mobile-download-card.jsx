/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppsBadge from './apps-badge';
import ReauthRequired from 'me/reauth-required';
import { Card, Button } from '@automattic/components';
import QuerySmsCountries from 'components/data/query-countries/sms';
import FormPhoneInput from 'components/forms/form-phone-input';
import getCountries from 'state/selectors/get-countries';
import { successNotice, errorNotice } from 'state/notices/actions';
import { fetchUserSettings } from 'state/user-settings/actions';
import { accountRecoverySettingsFetch } from 'state/account-recovery/settings/actions';
import {
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
} from 'state/account-recovery/settings/selectors';
import getUserSettings from 'state/selectors/get-user-settings';
import hasUserSettings from 'state/selectors/has-user-settings';
import { http } from 'state/data-layer/wpcom-http/actions';
import phoneValidation from 'lib/phone-validation';
import userAgent from 'lib/user-agent';
import twoStepAuthorization from 'lib/two-step-authorization';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { sendEmailLogin } from 'state/auth/actions';

function sendSMS( phone ) {
	function onSuccess( dispatch ) {
		dispatch( successNotice( i18n.translate( 'SMS Sent. Go check your messages!' ) ) );
	}

	function onFailure( dispatch ) {
		dispatch(
			errorNotice( i18n.translate( 'We couldn’t send the SMS — double check your number.' ) )
		);
	}

	return http( {
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		path: '/me/get-apps/send-download-sms',
		body: { phone },
		onSuccess,
		onFailure,
	} );
}

class MobileDownloadCard extends React.Component {
	static propTypes = {
		translate: PropTypes.func,
		countriesList: PropTypes.array.isRequired,
		storedPhone: PropTypes.shape( {
			countryCode: PropTypes.string,
			countryNumericCode: PropTypes.string,
			number: PropTypes.string,
			numberFull: PropTypes.string,
			isValid: PropTypes.bool,
		} ),
		hasLoadedStoredPhone: PropTypes.bool,
		hasSendingError: PropTypes.bool,
	};

	state = {
		phoneNumber: null,
	};

	componentDidMount() {
		twoStepAuthorization.on( 'change', this.maybeFetchAccountRecoverySettings );
		this.maybeFetchAccountRecoverySettings();
	}

	componentWillUnmount() {
		twoStepAuthorization.off( 'change', this.maybeFetchAccountRecoverySettings );
	}

	maybeFetchAccountRecoverySettings = () => {
		const hasReauthData = twoStepAuthorization.data ? true : false;
		const needsReauth = hasReauthData ? twoStepAuthorization.isReauthRequired() : true;

		if ( needsReauth === false ) {
			this.props.fetchUserSettings();
			this.props.accountRecoverySettingsFetch();
		}
	};

	getPreferredNumber = () => {
		const noPreferredNumber = {
			countryCode: null,
			countryNumericCode: null,
			number: null,
			numberFull: null,
			isValid: false,
		};

		if ( ! this.userSettingsHaveBeenLoadedWithAccountRecoveryPhone() ) {
			return noPreferredNumber;
		}

		const tfaNumber =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_phone_number : null;

		const tfaCountryCode =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_country : null;

		const tfaSMSEnabled =
			this.props.userSettings != null ? this.props.userSettings.two_step_sms_enabled : null;

		const accountRecoveryNumber = this.props.accountRecoveryPhone;

		// If the user has typed their own phone number,
		// that's the most preferred.
		if ( this.state.phoneNumber !== null ) {
			return this.state.phoneNumber;
		}

		// We proritize TFA over the account recovery number.
		// Also, if we have their TFA phone number, but they're not using
		// it for TFA, we won't show it to them, to avoid creeping them out.
		if ( tfaNumber !== null && tfaCountryCode !== null && tfaSMSEnabled ) {
			const countryCode = this.numericCountryCodeForCountryCode( tfaCountryCode );
			const fullNumber = countryCode + tfaNumber;

			return {
				countryCode: tfaCountryCode,
				countryNumericCode: countryCode,
				number: tfaNumber,
				numberFull: fullNumber,
				isValid: this.phoneNumberIsValid( fullNumber ),
			};
		}

		// Account recovery number already has the keys formatted in the
		// way we want, so we can just return it directly.
		if ( accountRecoveryNumber !== null ) {
			const isValid = this.phoneNumberIsValid( accountRecoveryNumber.numberFull );
			accountRecoveryNumber.isValid = isValid;

			return accountRecoveryNumber;
		}

		// Fallback if we didn't match anything
		return noPreferredNumber;
	};

	phoneNumberIsValid( number ) {
		return ! phoneValidation( number ).error;
	}

	numericCountryCodeForCountryCode( code ) {
		const element = this.props.countriesList.find( ( item ) => {
			return item.code === code;
		} );

		if ( element !== undefined ) {
			return element.numeric_code;
		}

		return null;
	}

	userSettingsHaveBeenLoadedWithAccountRecoveryPhone() {
		return this.props.hasUserSettings && this.props.hasLoadedAccountRecoveryPhone;
	}

	render() {
		const { translate } = this.props;

		const hasAllData = this.userSettingsHaveBeenLoadedWithAccountRecoveryPhone();
		const { countryCode, number, isValid } = this.getPreferredNumber();
		const { isMobile } = userAgent;
		const featureIsEnabled = ! isMobile;

		return (
			<Card className="get-apps__mobile">
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<div className="get-apps__store-subpanel">
					<div className="get-apps__card-text">
						<h3 className="get-apps__card-title">{ translate( 'Mobile Apps' ) }</h3>
						<p className="get-apps__description">
							{ translate( 'WordPress at your fingertips.' ) }
						</p>
					</div>
					<div className="get-apps__badges">
						<AppsBadge
							storeLink="https://play.google.com/store/apps/details?id=org.wordpress.android&referrer=utm_source%3Dcalypso-get-apps%26utm_medium%3Dweb%26utm_campaign%3Dmobile-download-promo-pages"
							storeName={ 'android' }
							titleText={ translate( 'Download the WordPress Android mobile app.' ) }
							altText={ translate( 'Google Play Store download badge' ) }
						/>
						<AppsBadge
							storeLink="https://itunes.apple.com/app/apple-store/id335703880?pt=299112&ct=calpyso-get-apps-button&mt=8"
							storeName={ 'ios' }
							titleText={ translate( 'Download the WordPress iOS mobile app.' ) }
							altText={ translate( 'Apple App Store download badge' ) }
						/>
					</div>
				</div>

				{ featureIsEnabled && (
					<div className="get-apps__sms-subpanel">
						<p>
							<strong>{ translate( 'Ready to WordPress on the go?' ) }</strong>
							<br />
							{ translate(
								'We’ll send you an SMS message with a download link for the right app for your mobile device.'
							) }
						</p>

						<div className="get-apps__sms-field-wrapper">
							<QuerySmsCountries />

							{ hasAllData ? (
								<FormPhoneInput
									countriesList={ this.props.countriesList }
									initialCountryCode={ countryCode }
									initialPhoneNumber={ number }
									phoneInputProps={ {
										onKeyUp: this.onKeyUp,
									} }
									onChange={ this.onChange }
								/>
							) : (
								<>
									<FormPhoneInput countriesList={ this.props.countriesList } isDisabled={ true } />
								</>
							) }
						</div>
						<div className="get-apps__sms-button-wrapper">
							<p>{ translate( 'Standard SMS rates may apply' ) }</p>

							<Button
								className="get-apps__sms-button"
								onClick={ this.onSubmit }
								disabled={ ! isValid }
							>
								{ translate( 'Text me a link' ) }
							</Button>
						</div>
					</div>
				) }

				<div className="get-apps__magic-link-subpanel">
					<div className="get-apps__card-text">
						<p>
							<strong>{ translate( 'Instantly log in to the mobile app' ) }</strong>
							<br />
							{ translate(
								'Send yourself links to download the app and instantly log in on your mobile device.'
							) }
						</p>
					</div>
					<div className="get-apps__link-button-wrapper">
						<Button className="get-apps__magic-link-button" onClick={ this.onSubmitLink }>
							{ translate( 'Email me a log in link' ) }
						</Button>
					</div>
				</div>
			</Card>
		);
	}

	onChange = ( phoneNumber ) => {
		this.setState( {
			phoneNumber: {
				countryCode: phoneNumber.countryData.code,
				countryNumericCode: phoneNumber.countryData.numeric_code,
				number: phoneNumber.phoneNumber,
				numberFull: phoneNumber.phoneNumberFull,
				isValid: phoneNumber.isValid,
			},
		} );
	};

	onKeyUp = ( event ) => {
		if ( event.key === 'Enter' ) {
			this.onSubmit( event );
		}
	};

	onSubmit = () => {
		const phoneNumber = this.getPreferredNumber().numberFull;
		this.props.sendSMS( phoneNumber );
	};

	onSubmitLink = () => {
		const email = this.props.userSettings.user_email;
		this.props.sendMagicLink( email );
	};
}

const sendMagicLink = ( email ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_get_apps_magic_link_button_click' ),
		sendEmailLogin( email, { showGlobalNotices: true, isMobileAppLogin: true } )
	);

export default connect(
	( state ) => ( {
		countriesList: getCountries( state, 'sms' ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		hasLoadedAccountRecoveryPhone: isAccountRecoverySettingsReady( state ),
		userSettings: getUserSettings( state ),
		hasUserSettings: hasUserSettings( state ),
	} ),
	{ sendSMS, sendMagicLink, fetchUserSettings, accountRecoverySettingsFetch, recordTracksEvent }
)( localize( MobileDownloadCard ) );
