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

const CustomerNotification = ( { item, checked, onChange, loaded } ) => {
	//Add field name to returned value
	const toggle = ( value ) => {
		onChange( {
			setting: item.field,
			option: 'enabled',
			value: value ? 'yes' : 'no',
		} );
	};

	return (
		<ListItem className="components__notification-component-item">
			<ListItemField className="components__notification-component-title-long">
				{ loaded ? (
					<FormLabel>{ item.title }</FormLabel>
				) : (
					<p className="components__is-placeholder" />
				) }
				{ loaded ? (
					<FormSettingExplanation>{ item.subtitle }</FormSettingExplanation>
				) : (
					<p className="components__is-placeholder" />
				) }
			</ListItemField>
			<ListItemField className="components__notification-component-toggle">
				{ loaded ? (
					<CompactFormToggle checked={ checked } onChange={ toggle } id={ item.field } />
				) : (
					<p className="components__is-placeholder" />
				) }
			</ListItemField>
		</ListItem>
	);
};

CustomerNotification.propTypes = {
	checked: PropTypes.bool,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
	loaded: PropTypes.bool,
};

export default CustomerNotification;
