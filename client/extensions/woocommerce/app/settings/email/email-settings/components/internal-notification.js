/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextValidation from 'components/forms/form-input-validation';
import { checkEmails } from './helpers';

const InternalNotification = ( { item, recipient, checked, onChange, loaded, translate } ) => {
	//Add field name to returned value
	const toggle = ( value ) => {
		onChange( {
			setting: item.field,
			option: 'enabled',
			value: value ? 'yes' : 'no',
		} );
	};

	const change = ( { target: { value } } ) => {
		onChange( {
			setting: item.field,
			option: 'recipient',
			value,
		} );
	};

	const checkedEmails = checkEmails( recipient );
	const emailValidationError = checkedEmails.error;
	const placeholderComponent = <p className="components__is-placeholder" />;

	return (
		<ListItem className="components__notification-component-item">
			<ListItemField className="components__notification-component-title">
				{ loaded ? <FormLabel>{ item.title }</FormLabel> : placeholderComponent }
				{ loaded ? (
					<FormSettingExplanation>{ item.subtitle }</FormSettingExplanation>
				) : (
					placeholderComponent
				) }
			</ListItemField>
			<ListItemField className="components__notification-component-input">
				<FormTextInput
					className={ ! loaded ? 'components__is-placeholder' : null }
					isError={ checked && emailValidationError }
					name={ item.field }
					onChange={ change }
					value={ recipient }
					placeholder={ translate( 'Recipient email address(es).' ) }
				/>
				{ emailValidationError && (
					<FormTextValidation isError text={ checkedEmails.messages[ 0 ].msg } />
				) }
			</ListItemField>
			<ListItemField className="components__notification-component-toggle">
				{ loaded ? (
					<CompactFormToggle checked={ checked } onChange={ toggle } id={ item.field } />
				) : (
					placeholderComponent
				) }
			</ListItemField>
		</ListItem>
	);
};

InternalNotification.propTypes = {
	checked: PropTypes.bool,
	recipient: PropTypes.string,
	item: PropTypes.object,
	loaded: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

export default localize( InternalNotification );
