/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

/**
 * Style dependencies
 */
import './style.scss';

function renderAffix( currencyValue, onCurrencyChange, currencyList ) {
	// If the currency value is not defined, don't render this affix at all
	if ( ! currencyValue ) {
		return null;
	}

	// If the currency is not editable, i.e., when `currencyList` is not defined, then just
	// render the plain value.
	if ( ! currencyList ) {
		return currencyValue;
	}

	// Find the currency code in the `currencyList` and return the label. If not found,
	// use the code itself as the label.
	const currencyLabel = get(
		find( currencyList, ( currency ) => currency.code === currencyValue ),
		'label',
		currencyValue
	);

	// For an editable currency, display a <select> overlay
	return (
		<span className="form-currency-input__affix">
			{ currencyLabel }
			<Gridicon icon="chevron-down" size={ 18 } className="form-currency-input__select-icon" />
			<select
				className="form-currency-input__select"
				value={ currencyValue }
				onChange={ onCurrencyChange }
				onBlur={ onCurrencyChange }
			>
				{ currencyList.map( ( { code, label = code } ) => (
					<option key={ code } value={ code }>
						{ label }
					</option>
				) ) }
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
	placeholder = '0.00',
	...props
} ) {
	const classes = classNames( 'form-currency-input', className );
	const prefix = renderAffix( currencySymbolPrefix, onCurrencyChange, currencyList );
	const suffix = renderAffix( currencySymbolSuffix, onCurrencyChange, currencyList );

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

const CurrencyShape = PropTypes.shape( {
	code: PropTypes.string.isRequired,
	label: PropTypes.string,
} );

FormCurrencyInput.propTypes = {
	currencySymbolPrefix: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	currencySymbolSuffix: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	onCurrencyChange: PropTypes.func,
	currencyList: PropTypes.arrayOf( CurrencyShape ),
};

export default FormCurrencyInput;
