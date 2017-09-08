/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';

// eslint-disable-next-line no-unused-vars
const TextInputRenderer = ( { input, meta: { error, touched }, ...props } ) => {
	const isError = !! ( touched && error );

	return (
		<span>
			<FormTextInput isError={ isError } { ...input } { ...props } />
			{ isError && <FormInputValidation isError text={ error } /> }
		</span>
	);
};

const ReduxFormTextInput = props => <Field component={ TextInputRenderer } { ...props } />;

ReduxFormTextInput.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextInput;
