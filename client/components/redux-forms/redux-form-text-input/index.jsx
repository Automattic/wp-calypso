/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

// eslint-disable-next-line no-unused-vars
const TextInputRenderer = ( { input, meta, ...props } ) => (
	<FormTextInput { ...input } { ...props } />
);

const ReduxFormTextInput = props => <Field component={ TextInputRenderer } { ...props } />;

ReduxFormTextInput.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextInput;
