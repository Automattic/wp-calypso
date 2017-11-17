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
			{ item.field }
		</FormLabel>
		<FormTextInput
			name={ item.name }
			onChange={ onChange }
			value={ recipient }
		/>
		<FormSettingExplanation>
			{ item.subtitle }
		</FormSettingExplanation>
	</FormFieldset>
);

NotificationsOrigin.propTypes = {
	checked: PropTypes.bool,
	recipient: PropTypes.string,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default NotificationsOrigin ;
