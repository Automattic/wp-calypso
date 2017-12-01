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
	<ListItem className="components__notification-component-item">
		<ListItemField className="components__notification-component-title" >
			{ ! isPlaceholder
				? <FormLabel>
					{ item.title }
				</FormLabel>
				: <p className="components__is-placeholder" />
			}
			{ ! isPlaceholder
				? <FormSettingExplanation>
					{ item.subtitle }
				</FormSettingExplanation>
				: <p className="components__is-placeholder" />
			}
		</ListItemField>
		<ListItemField className="components__notification-component-input" >
				<FormTextInput
					className={ isPlaceholder ? 'components__is-placeholder' : null }
					name={ item.field }
					onChange={ onChange }
					value={ recipient }
				/>
		</ListItemField>
		<ListItemField className="components__notification-component-toggle">
			{ ! isPlaceholder
				? <CompactFormToggle
					checked={ checked }
					onChange={ onToggle }
					id={ item.field }
				/>
				: <p className="components__is-placeholder" />
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
