/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

const TextInputRenderer = ( { input, meta, ...props } ) => (
	<FormTextInput { ...input } { ...props } />
);

const ReduxFormTextInput = ( props ) => <Field component={ TextInputRenderer } { ...props } />;

ReduxFormTextInput.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextInput;
