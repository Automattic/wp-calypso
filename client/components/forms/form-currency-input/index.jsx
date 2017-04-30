/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

export default function FormCurrencyInput( {
	className,
	currencySymbolPrefix,
	currencySymbolSuffix,
	...props
} ) {
	const classes = classNames( 'form-currency-input', className );

	return (
		<FormTextInputWithAffixes
			{ ...props }
			type="number"
			className={ classes }
			prefix={ currencySymbolPrefix }
			suffix={ currencySymbolSuffix }
		/>
	);
}

