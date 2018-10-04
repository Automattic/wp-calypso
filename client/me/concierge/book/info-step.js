/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import config from 'config';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import CompactCard from 'components/card/compact';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import IsRebrandCitiesSite from './is-rebrand-cities-site';
import Timezone from 'components/timezone';
import Site from 'blocks/site';
import { localize } from 'i18n-calypso';
import { updateConciergeSignupForm } from 'state/concierge/actions';
import getConciergeSignupForm from 'state/selectors/get-concierge-signup-form';
import getUserSettings from 'state/selectors/get-user-settings';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import PrimaryHeader from '../shared/primary-header';
import { recordTracksEvent } from 'state/analytics/actions';
import { getLanguage } from 'lib/i18n-utils';

class InfoStep extends Component {
	static propTypes = {
		currentUserLocale: PropTypes.string.isRequired,
		signupForm: PropTypes.object,
		userSettings: PropTypes.object,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
	};

	setTimezone = timezone => {
		this.props.updateConciergeSignupForm( { ...this.props.signupForm, timezone } );
	};

	updateSignupForm( name, value ) {
		this.props.updateConciergeSignupForm( {
			...this.props.signupForm,
			[ name ]: value,
		} );
	}

	setRebrandCitiesValue = value => {
		this.updateSignupForm( 'isRebrandCitiesSite', value );
	};

	setFieldValue = ( { target: { name, value } } ) => {
		this.updateSignupForm( name, value );
	};

	canSubmitForm = () => {
		const {
			signupForm: { firstname, message },
		} = this.props;

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
			signupForm: { firstname, lastname, message, timezone },
			site,
			translate,
		} = this.props;
		const language = getLanguage( currentUserLocale ).name;
		const isEnglish = includes( config( 'english_locales' ), currentUserLocale );
		const noticeText = translate(
			'All Concierge Sessions are in English (%(language)s is not available)',
			{
				args: { language },
			}
		);

		return (
			<div>
				<IsRebrandCitiesSite onChange={ this.setRebrandCitiesValue } siteId={ site.ID } />
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
						isPrimary={ true }
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
	state => ( {
		currentUserLocale: getCurrentUserLocale( state ),
		signupForm: getConciergeSignupForm( state ),
		userSettings: getUserSettings( state ),
	} ),
	{
		updateConciergeSignupForm,
		recordTracksEvent,
	}
)( localize( InfoStep ) );
