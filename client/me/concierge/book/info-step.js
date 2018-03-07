/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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
import Timezone from 'components/timezone';
import Site from 'blocks/site';
import { updateConciergeSignupForm } from 'state/concierge/actions';
import { getConciergeSignupForm, getUserSettings } from 'state/selectors';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import PrimaryHeader from '../shared/primary-header';
import { recordTracksEvent } from 'state/analytics/actions';
import { isDefaultLocale } from 'lib/i18n-utils';

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

	setFieldValue = ( { target } ) => {
		this.props.updateConciergeSignupForm( {
			...this.props.signupForm,
			[ target.name ]: target.value,
		} );
	};

	canSubmitForm = () => {
		const { signupForm: { firstname, message } } = this.props;

		return !! firstname.trim() && !! message.trim();
	};

	componentDidMount() {
		const { userSettings, signupForm: { firstname, lastname } } = this.props;

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
			signupForm: { firstname, lastname, message, timezone },
		} = this.props;
		const notice = ! isDefaultLocale( currentUserLocale )
			? 'Sessions are 30 minutes long and in English.'
			: null;

		return (
			<div>
				<PrimaryHeader />
				{ notice && <Notice showDismiss={ false } text={ notice } /> }
				<CompactCard className="book__info-step-site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>

				<CompactCard>
					<FormFieldset>
						<FormLabel htmlFor="firstname">{ 'First Name' }</FormLabel>
						<FormTextInput
							name="firstname"
							placeholder={ 'What may we call you?' }
							onChange={ this.setFieldValue }
							value={ firstname }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="lastname">{ 'Last Name' }</FormLabel>
						<FormTextInput
							name="lastname"
							placeholder={ 'Optionally, please tell us your last name.' }
							onChange={ this.setFieldValue }
							value={ lastname }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>{ "What's your timezone?" }</FormLabel>
						<Timezone
							includeManualOffsets={ false }
							name="timezone"
							onSelect={ this.setTimezone }
							selectedZone={ timezone }
						/>
						<FormSettingExplanation>{ 'Choose a city in your timezone.' }</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>{ 'What are you hoping to accomplish with your site?' }</FormLabel>
						<FormTextarea
							placeholder={
								'Sell products and services? Generate leads? Something else entirely?' +
								" Be as specific as you can! It helps us provide the information you're looking for."
							}
							name="message"
							onChange={ this.setFieldValue }
							value={ message }
						/>
					</FormFieldset>

					<FormButton
						disabled={ ! this.canSubmitForm() }
						isPrimary={ true }
						type="button"
						onClick={ this.props.onComplete }
					>
						{ 'Continue to calendar' }
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
)( InfoStep );
