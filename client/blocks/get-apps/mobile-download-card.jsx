import { Card } from '@automattic/components';
import { compose } from '@wordpress/compose';
import i18n, { localize, translate, withRtl } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AppImage from 'calypso/assets/images/jetpack/jetpack-app-graphic.png';
import QrCode from 'calypso/blocks/app-promo/qr-code';
import AnimatedIcon from 'calypso/components/animated-icon';
import phoneValidation from 'calypso/lib/phone-validation';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import userAgent from 'calypso/lib/user-agent';
import ReauthRequired from 'calypso/me/reauth-required';
import { accountRecoverySettingsFetch } from 'calypso/state/account-recovery/settings/actions';
import {
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
} from 'calypso/state/account-recovery/settings/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import AppsBadge from './apps-badge';

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

class MobileDownloadCard extends Component {
	static propTypes = {
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
		isRtl: PropTypes.bool,
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

	getAppStoreBadges() {
		const { isiPad, isiPod, isiPhone } = userAgent;
		const isIos = isiPad || isiPod || isiPhone;

		return (
			<div className="get-apps__badges">
				<p className="get-apps__card-text">
					{ translate(
						'Everything you need to publish, manage, and grow your site anywhere, any time.'
					) }
				</p>
				<AppsBadge
					storeName={ isIos ? 'ios' : 'android' }
					utm_source="calypso"
					utm_campaign={ isIos ? 'calypso-get-apps-button' : 'calypso-get-apps' }
				/>
			</div>
		);
	}

	getJetpackBrandedPanel() {
		const { isMobile } = userAgent;
		return (
			<>
				<div className="get-apps__store-subpanel">
					<div className="get-apps__card-text">
						<AnimatedIcon
							icon={ `/calypso/animations/app-promo/wp-to-jp${
								this.props.isRtl ? '-rtl' : ''
							}.json` }
							className="get-apps__mobile-icon"
						/>
						<h1 className="get-apps__card-title">
							{ translate(
								'Take WordPress on the go with the {{span}}Jetpack{{/span}} mobile app',
								{
									components: {
										span: <span className="get-apps__jetpack-branded-text" />,
									},
								}
							) }
						</h1>
					</div>
					<div className="get-apps__graphic">
						<img src={ AppImage } alt="" width="220px" height="212px" />
					</div>
				</div>
				{ isMobile ? this.getAppStoreBadges() : <QrCode /> }
			</>
		);
	}

	render() {
		return (
			<Card className="get-apps__mobile">
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				{ this.getJetpackBrandedPanel() }
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
}

export default compose(
	connect(
		( state ) => ( {
			countriesList: getCountries( state, 'sms' ),
			accountRecoveryPhone: getAccountRecoveryPhone( state ),
			hasLoadedAccountRecoveryPhone: isAccountRecoverySettingsReady( state ),
			userSettings: getUserSettings( state ),
			hasUserSettings: hasUserSettings( state ),
		} ),
		{ sendSMS, fetchUserSettings, accountRecoverySettingsFetch, recordTracksEvent }
	),
	withRtl,
	localize
)( MobileDownloadCard );
