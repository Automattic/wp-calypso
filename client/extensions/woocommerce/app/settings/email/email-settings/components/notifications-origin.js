/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const NotificationsOrigin = ( { item, recipient, onChange } ) => (
	<ListItem>
		<ListItemField className="components__notification-origin">
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
		</ListItemField>
	</ListItem>
);

NotificationsOrigin.propTypes = {
	recipient: PropTypes.string,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default NotificationsOrigin ;
