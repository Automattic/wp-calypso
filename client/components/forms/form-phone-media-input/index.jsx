/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import PhoneInput from 'components/phone-input';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';

export default function FormPhoneMediaInput( props ) {
	const {
		additionalClasses,
		label,
		countryCode,
		className,
		disabled,
		errorMessage,
		isError = 'false',
	} = props;

	return (
		<div className={ classnames( additionalClasses, 'phone' ) }>
			<div>
				<FormLabel htmlFor={ name }>{ label }</FormLabel>
				<PhoneInput
					{ ...omit( props, [ 'className', 'countryCode' ] ) }
					countryCode={ countryCode.toUpperCase() }
					className={ className }
					isError={ isError }
					disabled={ disabled }
				/>
			</div>
			{ errorMessage && <FormInputValidation text={ errorMessage } isError /> }
		</div>
	);
}
