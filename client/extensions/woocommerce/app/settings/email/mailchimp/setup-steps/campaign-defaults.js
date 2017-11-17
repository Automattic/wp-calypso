/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { translate } from 'i18n-calypso';

// Get reed of this, this should not be visible to the user - he does not need this.
const CampaignDefaults = ( { storeData = {}, onChange, validateFields } ) => {
	const fields = [
		{ name: 'campaign_from_name', explanation: translate( 'This is the name your emails will come from. Use ' +
			'something your subscribers will instantly recognize, like your company name.' ), label: translate( 'Default from name',
			{ comment: 'label for field that informs who sends the message' } ) },
		{ name: 'campaign_from_email', explanation: translate( 'The address that will receive reply emails. Check it ' +
			'regularly to stay in touch with your audience.' ), label: translate( 'Default from address' ) },
		{ name: 'campaign_subject', explanation: translate( 'Keep it relevant and non-spammy.' ), label: translate( 'Default subject' ) },
		{ name: 'campaign_permission_reminder', explanation: translate( 'Displayed at the bottom of ' +
			'your emails' ), label: translate( 'Permission reminder' ) },
		// campaign_language will be silently passed based on choice from the previous step.
	];

	return (
		<div>
			<p>
				{ translate( 'Configure the settings for emails sent using your MailChimp account below.' ) }
			</p>
			<div className="setup-steps__campaign-defaults">
				{ fields.map( ( item, index ) => (
					<FormFieldset key={ index }>
						<div>
							<FormLabel>
								{ item.label }
							</FormLabel>
							<FormTextInput
								name={ item.name }
								isError={ validateFields && ! storeData[ item.name ] }
								onChange={ onChange }
								value={ storeData[ item.name ] }
							/>
						<FormSettingExplanation>
							{ item.explanation }
						</FormSettingExplanation>
							{ ( validateFields && ! storeData[ item.name ] ) &&
								<FormInputValidation iserror text={ translate( 'field is required' ) } /> }
						</div>
					</FormFieldset>
				) ) }
			</div>
		</div>
	);
};

CampaignDefaults.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object.isRequired,
	validateFields: PropTypes.bool,
};

export default CampaignDefaults;
