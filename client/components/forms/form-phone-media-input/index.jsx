/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PhoneInput from 'components/phone-input';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';

export default function FormPhoneMediaInput( {
	additionalClasses,
	label,
	value,
	countryCode,
	className,
	disabled,
	errorMessage,
	isError = 'false',
	onChange,
	countriesList,
	setComponentReference,
	enableStickyCountry,
	children,
} ) {
	return (
		<div className={ classnames( additionalClasses, 'phone' ) }>
			<div>
				<FormLabel htmlFor={ name }>{ label }</FormLabel>
				<PhoneInput
					onChange={ onChange }
					value={ value }
					countriesList={ countriesList }
					setComponentReference={ setComponentReference }
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
