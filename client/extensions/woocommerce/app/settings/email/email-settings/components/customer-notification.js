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
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const CustomerNotification = ( { item, checked, onToggle } ) => (
	<FormFieldset>
		<FormLabel>
			{ item.field }
		</FormLabel>
		<FormSettingExplanation>
			{ item.subtitle }
		</FormSettingExplanation>
		<CompactFormToggle
			checked={ checked }
			onChange={ onToggle }
			id={ item.field }
		/>
	</FormFieldset>
);

CustomerNotification.propTypes = {
	checked: PropTypes.bool,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
};

export default CustomerNotification ;
