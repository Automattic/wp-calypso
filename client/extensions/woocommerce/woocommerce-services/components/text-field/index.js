/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FieldError from '../field-error';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const TextField = ( {
	id,
	title,
	description,
	value,
	placeholder,
	updateValue,
	error,
	className,
} ) => {
	const handleChangeEvent = ( event ) => updateValue( event.target.value );

	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id }>{ title }</FormLabel>
			<FormTextInput
				id={ id }
				name={ id }
				placeholder={ placeholder }
				value={ value }
				onChange={ handleChangeEvent }
				isError={ Boolean( error ) }
			/>
			{ error && typeof error === 'string' && <FieldError text={ error } /> }
			{ ! error && description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
		</FormFieldset>
	);
};

TextField.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.node,
	description: PropTypes.string,
	value: PropTypes.string.isRequired,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	className: PropTypes.string,
};

export default TextField;
