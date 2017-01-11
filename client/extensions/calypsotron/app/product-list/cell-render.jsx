/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';
import FormCheckbox from 'components/forms/form-checkbox';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import TokenField from 'components/token-field';

/**
 * Internal dependencies
 */
import FormNumberInput from '../../components/forms/form-number-input';
import FormCurrencyInput from '../../components/forms/form-currency-input';

// View Renderers
// Parameter Format: product, key, constraints, helpers

export function renderString( product, key ) {
	return product[ key ];
}

// Constraint (optional): nanString - Custom string for when value is NaN
export function renderInteger( product, key, constraints ) {
	const value = Number( product[ key ] );
	const nanString = constraints && constraints.nanString || '';

	if ( value ) {
		return ( ! isNaN( value ) ? value : nanString );
	}

	return '';
}

// Constraint (optional): trueValues - Custom set of values that denote true
// Constraint (optional): trueIcon - Custom icon for when value is true
// Constraint (optional): falseIcon - Custom icon for when value is false
export function renderBoolean( product, key, constraints ) {
	const trueValues = constraints && constraints.trueValues || [ true, 'true', 'yes' ];
	const trueIcon = ( constraints && constraints.hasOwnProperty( 'trueIcon' ) ? constraints.trueIcon : 'checkmark' );
	const falseIcon = ( constraints && constraints.hasOwnProperty( 'falseIcon' ) ? constraints.falseIcon : 'cross-small' );
	const value = trueValues.includes( product[ key ] );

	if ( value ) {
		return trueIcon && <Gridicon icon={ trueIcon } />;
	}

	return falseIcon && <Gridicon icon={ falseIcon } />;
}

export function renderCurrency( product, key, constraints, helpers ) {
	const value = product[ key ];
	const { currencySymbol, currencyIsPrefix, currencyDecimals, numberFormat } = helpers;
	if ( value ) {
		const number = numberFormat( value, currencyDecimals );
		let text;

		if ( currencyIsPrefix ) {
			text = currencySymbol + number;
		} else {
			text = number + currencySymbol;
		}
		return text;
	}

	return '';
}

export function renderCategories( product, key ) {
	const value = product[ key ];

	if ( value ) {
		const names = value.map( ( c ) => c.name );

		return names.join();
	}

	return '';
}

export function renderTags( product, key ) {
	const value = product[ key ];

	if ( value ) {
		const names = value.map( ( c ) => c.name );

		return names.join();
	}

	return '';
}

// Edit Renderers
// Parameter Format: product, key, constraints, helpers, disabled, onEdit

export function renderTextInput( product, key, constraints, helpers, disabled, onEdit ) {
	const onChange = ( evt ) => {
		const value = evt.target.value;
		// TODO: Add customizable validation step here?
		onEdit( product, key, value );
	};

	return (
		<FormTextInput id={ key } disabled={ disabled } value={ product[ key ] } onChange={ onChange } />
	);
}

// Constraint (optional): min - Minimunm numeric value allowed.
// Constraint (optional): max - Maximum numeric value allowed.
export function renderNumberInput( product, key, constraints, helpers, disabled, onEdit ) {
	const onChange = ( evt ) => {
		const value = evt.target.value;
		// TODO: Add customizable validation step here?
		onEdit( product, key, value );
	};

	const constraintsProps = {};

	if ( constraints ) {
		if ( constraints.min ) {
			constraintsProps.min = constraints.min;
		} else if ( constraints.max ) {
			constraintsProps.max = constraints.max;
		}
	}

	const value = product[ key ] || '';

	return (
		<FormNumberInput
			id={ key }
			disabled={ disabled }
			value={ value }
			onChange={ onChange }
			{ ...constraintsProps } />
	);
}

export function renderCurrencyInput( product, key, constraints, helpers, disabled, onEdit ) {
	const onChange = ( evt ) => {
		const value = evt.target.value;
		// TODO: Add customizable validation step here?
		onEdit( product, key, value );
	};

	const constraintsProps = {};

	if ( constraints ) {
		if ( constraints.min ) {
			constraintsProps.min = constraints.min;
		} else if ( constraints.max ) {
			constraintsProps.max = constraints.max;
		}
	}

	const value = product[ key ] || '';

	return (
		<FormCurrencyInput
			id={ key }
			disabled={ disabled }
			value={ value }
			onChange={ onChange }
			currencySymbol={ helpers.currencySymbol }
			currencySymbolIsPrefix={ helpers.currencyIsPrefix }
			{ ...constraintsProps }
		/>
	);
}

// Constraint (optional): trueValue - Custom value that is set when checkbox is checked.
// Constraint (optional): falseValue - Custom value that is set when checkbox is checked.
export function renderCheckboxInput( product, key, constraints, helpers, disabled, onEdit ) {
	const trueValue = ( constraints && constraints.hasOwnProperty( 'trueValue' ) ? constraints.trueValue : true );
	const falseValue = ( constraints && constraints.hasOwnProperty( 'falseValue' ) ? constraints.falseValue : false );
	const value = trueValue === product[ key ];

	const onChange = ( evt ) => {
		const changeValue = ( evt.target.checked ? trueValue : falseValue );
		onEdit( product, key, changeValue );
	};

	return (
		<FormCheckbox id={ key } disabled={ disabled } checked={ value } onChange={ onChange } />
	);
}

// Constraint (required): getOptions - Function( product, key, helpers ), return array of: { name: <string>, value: <any> }
// Constraint (optional): inConvert - Function ( dataValue, helpers ),
//                        converts from product[ key ] to TokenField value array.
export function renderSelectInput( product, key, constraints, helpers, disabled, onEdit ) {
	const getOptions = constraints.getOptions || ( () => [] );
	const inConvert = constraints.inConvert || ( ( value ) => value );
	const outConvert = constraints.outConvert || ( ( value ) => value );

	const options = getOptions( product, key, helpers );
	const value = inConvert( product[ key ], helpers );

	const onChange = ( evt ) => {
		const convertedValue = outConvert( evt.target.value, helpers );
		onEdit( product, key, convertedValue );
	};

	const optionTags = [];
	options.forEach( ( option ) => {
		optionTags.push( <option key={ option.name } value={ option.value } >{ option.name }</option> );
	} );

	return (
		<FormSelect id={ key } disabled={ disabled } value={ value } onChange={ onChange } >
			{ optionTags }
		</FormSelect>
	);
}

// Constraint (required): getSuggestions - Function ( product, key, helpers ), return array of strings
// Constraint (optional): inConvert - Function ( dataValue, helpers ),
//                        converts from product[ key ] to TokenField value array.
// Constraint (optional): outConvert - Function ( tokenFieldValue, helpers ),
//                        converts from TokenField-compatible values to product[ key ] value.
export function renderTokenField( product, key, constraints, helpers, disabled, onEdit ) {
	const inConvert = constraints.inConvert || ( ( value ) => value );
	const outConvert = constraints.outConvert || ( ( value ) => value );

	const suggestions = constraints.getSuggestions( product, key, helpers );
	const value = inConvert( product[ key ], helpers );

	const onChange = ( changeValue ) => {
		const convertedValue = outConvert( changeValue, helpers );
		onEdit( product, key, convertedValue );
	};

	return (
		<TokenField
			id={ key }
			value={ value }
			onChange={ onChange }
			suggestions={ suggestions }
			disabled={ disabled }
		/>
	);
}

