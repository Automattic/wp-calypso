/** @format */
/*
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

/*
 * Render a `FormFieldset` parametrized by the input field component type.
 * It accepts props that are compatible with what Redux Form `Field` passes down to renderers.
 * See the `Field` documentation for info about the props.
 */
export const RenderFieldset = ( {
	inputComponent: InputComponent,
	input,
	meta,
	label,
	explanation,
	...props
} ) => {
	const isError = !! ( meta.touched && meta.error );

	return (
		<FormFieldset>
			{ label &&
				<FormLabel htmlFor={ input.name }>
					{ label }
				</FormLabel> }
			<InputComponent id={ input.name } isError={ isError } { ...input } { ...props } />
			{ isError && <FormInputValidation isError text={ meta.error } /> }
			{ explanation &&
				<FormSettingExplanation>
					{ explanation }
				</FormSettingExplanation> }
		</FormFieldset>
	);
};

/*
 * Convenience wrapper around Redux Form `Field` to render a `FormFieldset`. Usage:
 *   <ReduxFormFieldset name="firstName" label="First Name" component={ FormTextInput } />
 */
const ReduxFormFieldset = ( { component, ...props } ) =>
	<Field component={ RenderFieldset } inputComponent={ component } { ...props } />;

ReduxFormFieldset.propTypes = {
	name: PropTypes.string.isRequired, // name of the Redux Form field to connect to
	component: PropTypes.func.isRequired, // input component to render inside the Fieldset
	label: PropTypes.node, // optional label for the field
	explanation: PropTypes.node, // optional explanation for the field
	// all other props will be passed to the input component
};

export default ReduxFormFieldset;
