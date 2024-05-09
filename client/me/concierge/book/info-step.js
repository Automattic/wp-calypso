import config from '@automattic/calypso-config';
import { CompactCard, FormInputValidation, FormLabel } from '@automattic/components';
import { getLanguage } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import Notice from 'calypso/components/notice';
import Timezone from 'calypso/components/timezone';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateConciergeSignupForm } from 'calypso/state/concierge/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getConciergeSignupForm from 'calypso/state/selectors/get-concierge-signup-form';
import getCountries from 'calypso/state/selectors/get-countries';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import PrimaryHeader from '../shared/primary-header';

class InfoStep extends Component {
	static propTypes = {
		currentUserLocale: PropTypes.string.isRequired,
		signupForm: PropTypes.object,
		userSettings: PropTypes.object,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	state = {
		validation: '',
	};

	setTimezone = ( timezone ) => {
		this.props.updateConciergeSignupForm( { ...this.props.signupForm, timezone } );
	};

	updateSignupForm( name, value ) {
		this.props.updateConciergeSignupForm( {
			...this.props.signupForm,
			[ name ]: value,
		} );
	}

	onChange = ( phoneNumber ) => {
		if ( phoneNumber.phoneNumber && ! phoneNumber.isValid ) {
			this.setState( {
				validation: this.props.translate( 'Please enter a valid phone number.' ),
			} );
		} else {
			this.setState( { validation: '' } );
		}

		this.props.updateConciergeSignupForm( {
			...this.props.signupForm,
			countryCode: phoneNumber.countryData.code,
			phoneNumberWithoutCountryCode: phoneNumber.phoneNumber,
			phoneNumber: phoneNumber.phoneNumber ? phoneNumber.phoneNumberFull : '',
		} );
	};

	setFieldValue = ( { target: { name, value } } ) => {
		this.updateSignupForm( name, value );
	};

	canSubmitForm = () => {
		const {
			signupForm: { firstname, message },
		} = this.props;

		if ( this.state.validation ) {
			return false;
		}

		return !! firstname.trim() && !! message.trim();
	};

	componentDidMount() {
		const {
			userSettings,
			signupForm: { firstname, lastname },
		} = this.props;

		this.props.recordTracksEvent( 'calypso_concierge_book_info_step' );

		if ( ! firstname && ! lastname ) {
			// Prefill the firstname & lastname fields by user settings.
			this.props.updateConciergeSignupForm( {
				...this.props.signupForm,
				firstname: userSettings.first_name,
				lastname: userSettings.last_name,
			} );
		}
	}

	render() {
		const {
			currentUserLocale,
			onComplete,
			signupForm: {
				firstname,
				lastname,
				message,
				timezone,
				countryCode,
				phoneNumberWithoutCountryCode,
			},
			site,
			translate,
		} = this.props;
		const language = getLanguage( currentUserLocale ).name;
		const isEnglish = includes( config( 'english_locales' ), currentUserLocale );
		const noticeText = translate( 'All sessions are in English (%(language)s is not available)', {
			args: { language },
		} );

		return (
			<div>
				<PrimaryHeader />
				{ ! isEnglish && <Notice showDismiss={ false } text={ noticeText } /> }
				<CompactCard className="book__info-step-site-block">
					<Site siteId={ site.ID } />
				</CompactCard>

				<CompactCard>
					<FormFieldset>
						<FormLabel htmlFor="firstname">{ translate( 'First Name' ) }</FormLabel>
						<FormTextInput
							name="firstname"
							placeholder={ translate( 'What may we call you?' ) }
							onChange={ this.setFieldValue }
							value={ firstname }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="lastname">{ translate( 'Last Name' ) }</FormLabel>
						<FormTextInput
							name="lastname"
							placeholder={ translate( 'Optionally, please tell us your last name.' ) }
							onChange={ this.setFieldValue }
							value={ lastname }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>{ translate( "What's your timezone?" ) }</FormLabel>
						<Timezone
							includeManualOffsets={ false }
							name="timezone"
							onSelect={ this.setTimezone }
							selectedZone={ timezone }
						/>
						<FormSettingExplanation>
							{ translate( 'Choose a city in your timezone.' ) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<QuerySmsCountries />
						<FormPhoneInput
							name="phoneNumber"
							countriesList={ this.props.countriesList }
							onChange={ this.onChange }
							initialCountryCode={ countryCode }
							initialPhoneNumber={ phoneNumberWithoutCountryCode }
							className="book__info-step-phone-input"
						/>
						<FormSettingExplanation>
							{ translate( 'We will not call you — this is so that we can send you a reminder.' ) }
						</FormSettingExplanation>

						{ this.state.validation && (
							<FormInputValidation isError text={ this.state.validation } />
						) }
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							{ translate( 'What are you hoping to accomplish with your site?' ) }
						</FormLabel>
						<FormTextarea
							placeholder={ translate(
								'Sell products and services? Generate leads? Something else entirely?' +
									" Be as specific as you can! It helps us provide the information you're looking for."
							) }
							name="message"
							onChange={ this.setFieldValue }
							value={ message }
						/>

						{ ! isEnglish && (
							<FormSettingExplanation>
								{ translate( 'Please respond in English.' ) }
							</FormSettingExplanation>
						) }
					</FormFieldset>

					<FormButton
						disabled={ ! this.canSubmitForm() }
						isPrimary
						type="button"
						onClick={ onComplete }
					>
						{ translate( 'Continue to calendar' ) }
					</FormButton>
				</CompactCard>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		currentUserLocale: getCurrentUserLocale( state ),
		signupForm: getConciergeSignupForm( state ),
		userSettings: getUserSettings( state ),
		countriesList: getCountries( state, 'sms' ),
	} ),
	{
		updateConciergeSignupForm,
		recordTracksEvent,
	}
)( localize( InfoStep ) );
