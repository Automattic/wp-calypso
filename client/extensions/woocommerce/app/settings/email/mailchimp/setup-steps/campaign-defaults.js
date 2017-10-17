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
import { translate } from 'i18n-calypso';

// Get reed of this, this should not be visible to the user - he does not need this.
const CampaignDefaults = ( { storeData = {}, onChange, validateFields } ) => {
	const fields = [
		{ name: 'campaign_from_name', label: translate( 'From',
			{ comment: 'label for field that informs who sends the message' } ) },
		{ name: 'campaign_from_email', label: translate( 'From Email' ) },
		{ name: 'campaign_subject', label: translate( 'Subject' ) },
		{ name: 'campaign_permission_reminder', label: translate( 'Permission reminder' ) },
		// campaign_language will be silently passed based on choice from the previous step.
	];

	return (
		<div>
			<div className="setup-steps__campaign-defaults-title">
				{ translate( 'Campaign Email Settings.' ) }
			</div>
			<FormFieldset className="setup-steps__campaign-defaults">
				{ fields.map( ( item, index ) => (
					<div key={ index }>
						<FormLabel>
							{ item.label }
						</FormLabel>
						<FormTextInput
							name={ item.name }
							isError={ validateFields && ! storeData[ item.name ] }
							onChange={ onChange }
							value={ storeData[ item.name ] }
						/>
						{ ( validateFields && ! storeData[ item.name ] ) && <FormInputValidation iserror text="field is required" /> }
					</div>
				) ) }
			</FormFieldset>
		</div>
	);
};

CampaignDefaults.propTypes = {
	onChange: PropTypes.func.isRequired,
	storeData: PropTypes.object.isRequired,
	validateFields: PropTypes.bool,
};

export default CampaignDefaults;
