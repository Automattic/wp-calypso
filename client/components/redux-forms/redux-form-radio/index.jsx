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
import FormRadio from 'components/forms/form-radio';

// eslint-disable-next-line no-unused-vars
const RenderRadio = ( { input, meta, type, ...props } ) => <FormRadio { ...input } { ...props } />;

const ReduxFormRadio = props => <Field component={ RenderRadio } type="radio" { ...props } />;

ReduxFormRadio.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
};

export default ReduxFormRadio;
