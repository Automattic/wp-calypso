/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PhoneInput from 'calypso/components/phone-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormInputValidation from 'calypso/components/forms/form-input-validation';

export default function FormPhoneMediaInput( {
	additionalClasses,
	label,
	name,
	value,
	countryCode,
	className,
	disabled,
	errorMessage,
	isError,
	onChange,
	countriesList,
	enableStickyCountry,
	inputRef,
	children,
} ) {
	return (
		<div className={ classnames( additionalClasses, 'phone' ) }>
			<div>
				<FormLabel htmlFor={ name }>{ label }</FormLabel>
				<PhoneInput
					inputRef={ inputRef }
					name={ name }
					onChange={ onChange }
					value={ value }
					countriesList={ countriesList }
					enableStickyCountry={ enableStickyCountry }
					countryCode={ countryCode.toUpperCase() }
					className={ className }
					isError={ isError }
					disabled={ disabled }
				/>
				{ children }
			</div>
			{ errorMessage && <FormInputValidation text={ errorMessage } isError /> }
		</div>
	);
}
