/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';

const CustomerNotification = ( { item, checked, onToggle, isPlaceholder } ) => (
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

CustomerNotification.propTypes = {
	checked: PropTypes.bool,
	item: PropTypes.object,
	onToggle: PropTypes.func.isRequired,
};

export default CustomerNotification ;
