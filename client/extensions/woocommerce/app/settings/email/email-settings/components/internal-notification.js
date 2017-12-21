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
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const InternalNotification = ( { item, recipient, checked, onToggle, onChange, isPlaceholder } ) => (
	<ListItem className="components__notification-component">
		<ListItemField className="components__notification-component-title" >
			{ ! isPlaceholder
				? <FormLabel>
					{ item.title }
				</FormLabel>
				: <p className="components__notification-placeholder-title" />
			}
			{ ! isPlaceholder
				? <FormSettingExplanation>
					{ item.subtitle }
				</FormSettingExplanation>
				: <p className="components__notification-placeholder-title" />
			}
		</ListItemField>
		<ListItemField>
			{ ! isPlaceholder
				? <FormTextInput
					className="components__notification-component-input"
					name={ item.field }
					onChange={ onChange }
					value={ recipient }
				/>
				: <p className="components__notification-placeholder-input" />
			}
		</ListItemField>
		<ListItemField className="components__notification-component-toggle">
			{ ! isPlaceholder
				? <CompactFormToggle
					checked={ checked }
					onChange={ onToggle }
					id={ item.field }
				/>
				: <p className="components__notification-placeholder-toggle" />
			}
		</ListItemField>
	</ListItem>
);

InternalNotification.propTypes = {
	checked: PropTypes.bool,
	recipient: PropTypes.string,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default InternalNotification ;
