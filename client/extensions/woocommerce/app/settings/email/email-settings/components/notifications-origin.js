/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
const NotificationsOrigin = ( {
	item,
	recipient,
	onChange,
	loaded,
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

	const placeholderComponent = <p className="components__is-placeholder" />;

	return (
		<div className="components__notification-origin">
			{ loaded ? <FormLabel>{ item.title }</FormLabel> : placeholderComponent }
			<FormTextInput
				className={ ! loaded ? 'components__is-placeholder' : null }
				isError={ emailValidationError }
				name={ item.field }
				onChange={ change }
				value={ recipient }
				placeholder={ placeholder }
			/>
			{ emailValidationError && (
				<FormTextValidation
					isError
					text={ translate( '%(recipient)s is not a valid email address.', {
						args: { recipient },
					} ) }
				/>
			) }
			{ loaded ? (
				<FormSettingExplanation>{ item.subtitle }</FormSettingExplanation>
			) : (
				placeholderComponent
			) }
		</div>
	);
};

NotificationsOrigin.propTypes = {
	recipient: PropTypes.string,
	item: PropTypes.object,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	loaded: PropTypes.bool,
	checkEmail: PropTypes.bool,
};

export default localize( NotificationsOrigin );
