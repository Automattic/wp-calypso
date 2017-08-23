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
import FormTextInput from 'components/forms/form-text-input';

// eslint-disable-next-line no-unused-vars
const RenderFormTextInput = ( { input, meta, ...props } ) =>
	<FormTextInput { ...input } { ...props } />;

const ReduxFormTextInput = props => <Field component={ RenderFormTextInput } { ...props } />;

ReduxFormTextInput.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextInput;
