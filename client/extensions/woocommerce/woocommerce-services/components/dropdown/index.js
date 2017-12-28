/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'client/components/forms/form-fieldset';
import FormSelect from 'client/components/forms/form-select';
import FormLegend from 'client/components/forms/form-legend';
import FieldError from '../field-error';
import FormSettingExplanation from 'client/components/forms/form-setting-explanation';

const Dropdown = ( { id, valuesMap, title, description, value, updateValue, error, disabled, className } ) => {
	const onChange = ( event ) => updateValue( event.target.value );

	return (
		<FormFieldset className={ className }>
			<FormLegend>{ title }</FormLegend>
			<FormSelect
				id={ id }
				name={ id }
				value={ value }
				onChange={ onChange }
				disabled={ Boolean( disabled ) }
				isError={ Boolean( error ) } >
				{ Object.keys( valuesMap ).map( key => {
					return (
						<option
							key={ key }
							value={ key }>
							{ valuesMap[ key ] }
						</option>
					);
				} ) }
			</FormSelect>
			{ error && <FieldError text={ error } /> }
			{ ! error && description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
		</FormFieldset>
	);
};

Dropdown.propTypes = {
	id: PropTypes.string.isRequired,
	valuesMap: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.string.isRequired,
	updateValue: PropTypes.func.isRequired,
	error: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.bool,
	] ),
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

export default Dropdown;
