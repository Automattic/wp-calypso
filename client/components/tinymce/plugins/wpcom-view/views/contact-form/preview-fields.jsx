/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PreviewFieldset from './preview-fieldset';
import PreviewLegend from './preview-legend';
import PreviewRequired from './preview-required';

import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';

const textField = ( field, index ) => (
	<PreviewFieldset key={ 'contact-form-field-' + index }>
		<PreviewLegend { ...field } />
		<FormTextInput />
	</PreviewFieldset>
);

const textarea = ( field, index ) => (
	<PreviewFieldset key={ 'contact-form-field-' + index }>
		<PreviewLegend { ...field } />
		<textarea />
	</PreviewFieldset>
);

const checkbox = ( field, index ) => (
	<PreviewFieldset key={ 'contact-form-field-' + index }>
		<FormLabel>
			<FormInputCheckbox />
			{ field.label }
			<PreviewRequired required={ field.required } />
		</FormLabel>
	</PreviewFieldset>
);

const select = ( field, index ) => (
	<PreviewFieldset key={ 'contact-form-field-' + index }>
		<PreviewLegend { ...field } />
		<FormSelect>
			{ [].concat( field.options.split( ',' ) ).map( ( option, optionIndex ) => (
				<option key={ 'contact-form-select-option-' + optionIndex }>{ option }</option>
			) ) }
		</FormSelect>
	</PreviewFieldset>
);

const radio = ( field, index ) => (
	<PreviewFieldset key={ 'contact-form-field-' + index }>
		<PreviewLegend { ...field } />
		{ [].concat( field.options.split( ',' ) ).map( ( option, optionIndex ) => (
			<FormLabel key={ 'contact-form-radio-' + optionIndex }>
				<FormRadio label={ option } />
			</FormLabel>
		) ) }
	</PreviewFieldset>
);

const fieldTypes = {
	name: textField,
	email: textField,
	url: textField,
	text: textField,
	textarea,
	checkbox,
	select,
	radio,
};

export default function ( field ) {
	return fieldTypes.hasOwnProperty( field.type )
		? fieldTypes[ field.type ].apply( this, arguments )
		: null;
}
