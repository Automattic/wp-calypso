/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const NotificationsOrigin = ( { item, recipient, onChange } ) => (
	<FormFieldset>
		<FormLabel>
			{ item.title }
		</FormLabel>
		<FormTextInput
			name={ item.field }
			onChange={ onChange }
			value={ recipient }
		/>
		<FormSettingExplanation>
			{ item.subtitle }
		</FormSettingExplanation>
	</FormFieldset>
);

NotificationsOrigin.propTypes = {
	recipient: PropTypes.string,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default NotificationsOrigin ;
