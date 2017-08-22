/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

function renderAffix( currencyValue, onCurrencyChange, currencyList, visualCurrencyList ) {
	// If the currency value is not defined, don't render this affix at all
	if ( ! currencyValue ) {
		return null;
	}

	// If the currency is not editable, i.e., when `currencyList` is not defined, then just
	// render the plain value.
	if ( ! currencyList ) {
		return currencyValue;
	}

	// For an editable currency, display a <select> overlay
	return (
		<span className="form-currency-input__affix">
			{ ( visualCurrencyList && visualCurrencyList[ currencyValue ] ) || currencyValue }
			<Gridicon icon="chevron-down" size={ 18 } className="form-currency-input__select-icon" />
			<select
				className="form-currency-input__select"
				value={ currencyValue }
				onChange={ onCurrencyChange }
			>
				{ currencyList.map( code =>
					<option key={ code } value={ code }>
						{ ( visualCurrencyList && visualCurrencyList[ code ] ) || code }
					</option>
				) }
			</select>
		</span>
	);
}

function FormCurrencyInput( {
	className,
	currencySymbolPrefix,
	currencySymbolSuffix,
	onCurrencyChange,
	currencyList,
	visualCurrencyList,
	placeholder = '0.00',
	...props
} ) {
	const classes = classNames( 'form-currency-input', className );
	const prefix = renderAffix(
		currencySymbolPrefix,
		onCurrencyChange,
		currencyList,
		visualCurrencyList
	);
	const suffix = renderAffix(
		currencySymbolSuffix,
		onCurrencyChange,
		currencyList,
		visualCurrencyList
	);

	return (
		<FormTextInputWithAffixes
			{ ...props }
			type="number"
			className={ classes }
			prefix={ prefix }
			suffix={ suffix }
			placeholder={ placeholder }
		/>
	);
}

FormCurrencyInput.propTypes = {
	currencySymbolPrefix: PropTypes.string,
	currencySymbolSuffix: PropTypes.string,
	onCurrencyChange: PropTypes.func,
	currencyList: PropTypes.array,
	visualCurrencyList: PropTypes.object,
};

export default FormCurrencyInput;
