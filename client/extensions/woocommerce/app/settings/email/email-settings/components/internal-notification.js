/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const InternalNotification = ( { item, recipient, checked, onToggle, onChange } ) => (
	<FormFieldset>
		<FormLabel>
			{ item.field }
		</FormLabel>
		<FormSettingExplanation>
			{ item.subtitle }
		</FormSettingExplanation>
		<FormTextInput
			name={ item.name }
			onChange={ onChange }
			value={ recipient }
		/>
		<CompactFormToggle
			checked={ checked }
			onChange={ onToggle }
			id={ item.field }
		/>
	</FormFieldset>
);

InternalNotification.propTypes = {
	checked: PropTypes.bool,
	recipient: PropTypes.string,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default InternalNotification ;
