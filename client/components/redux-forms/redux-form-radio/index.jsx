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

const RadioRenderer = ( { input, meta, type, ...props } ) => (
	<FormRadio { ...input } { ...props } />
);

const ReduxFormRadio = ( props ) => <Field component={ RadioRenderer } type="radio" { ...props } />;

ReduxFormRadio.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
};

export default ReduxFormRadio;
