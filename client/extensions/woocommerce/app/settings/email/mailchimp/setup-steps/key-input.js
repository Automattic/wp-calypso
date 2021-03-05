/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { localize } from 'i18n-calypso';

const KeyInputStep = localize( ( { translate, onChange, apiKey, isKeyCorrect } ) => (
	<FormFieldset className="setup-steps__mailchimp-key-input">
		<p>
			{ translate(
				"Now that you're signed in to MailChimp, you need an API key to start the connection process."
			) }
		</p>
		<FormLabel required>{ translate( 'Mailchimp API Key:' ) }</FormLabel>
		<FormTextInput
			name={ 'api_key' }
			isError={ ! isKeyCorrect }
			placeholder={ 'Enter your MailChimp API key' }
			onChange={ onChange }
			value={ apiKey }
		/>
		{ ! isKeyCorrect &&
			( apiKey ? (
				<FormInputValidation isError text={ translate( 'Key appears to be invalid.' ) } />
			) : (
				<FormInputValidation
					isError
					text={ translate( 'An API key is required to make a connection.' ) }
				/>
			) ) }
		<FormSettingExplanation>
			{ translate(
				'To find your MailChimp API key click your profile picture, select Account and go to Extras ' +
					'> API keys. From there, grab an existing key or generate a new one for your store.'
			) }
		</FormSettingExplanation>
	</FormFieldset>
) );

KeyInputStep.propTypes = {
	apiKey: PropTypes.string,
	isKeyCorrect: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

export default KeyInputStep;
