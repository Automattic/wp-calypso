/** @format */

/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextValidation from 'components/forms/form-input-validation';
const NotificationsOrigin = ( {
	item,
	recipient,
	onChange,
	isPlaceholder,
	checkEmail,
	translate,
	placeholder,
} ) => {
	const change = ( { target: { value } } ) => {
		onChange( {
			setting: item.field,
			option: item.option,
			value,
		} );
	};

	const emailValidationError =
		checkEmail && recipient.length !== 0 && ! emailValidator.validate( recipient );

	return (
		<ListItem>
			<ListItemField className="components__notification-origin">
				{ ! isPlaceholder ? (
					<FormLabel>{ item.title }</FormLabel>
				) : (
					<p className="components__is-placeholder" />
				) }
				<FormTextInput
					className={ isPlaceholder ? 'components__is-placeholder' : null }
					isError={ emailValidationError }
					name={ item.field }
					onChange={ change }
					value={ recipient }
					placeholder={ placeholder }
				/>
				{ emailValidationError && (
					<FormTextValidation
						isError={ true }
						text={ translate( '%(recipient)s is not a valid email address.', {
							args: { recipient },
						} ) }
					/>
				) }
				{ ! isPlaceholder ? (
					<FormSettingExplanation>{ item.subtitle }</FormSettingExplanation>
				) : (
					<p className="components__is-placeholder" />
				) }
			</ListItemField>
		</ListItem>
	);
};

NotificationsOrigin.propTypes = {
	recipient: PropTypes.string,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

export default localize( NotificationsOrigin );
