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

const NotificationsOrigin = ( { item, recipient, onChange, isPlaceholder } ) => (
	<ListItem>
		<ListItemField className="components__notification-origin">
			{ ! isPlaceholder
				? <FormLabel>
					{ item.title }
				</FormLabel>
				: <p className="components__is-placeholder" />
			}
			<FormTextInput
				className={ isPlaceholder ? 'components__is-placeholder' : null }
				name={ item.field }
				onChange={ onChange }
				value={ recipient }
			/>
			{ ! isPlaceholder
				? <FormSettingExplanation>
					{ item.subtitle }
				</FormSettingExplanation>
				: <p className="components__is-placeholder" />
			}
		</ListItemField>
	</ListItem>
);

NotificationsOrigin.propTypes = {
	recipient: PropTypes.string,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default NotificationsOrigin ;
