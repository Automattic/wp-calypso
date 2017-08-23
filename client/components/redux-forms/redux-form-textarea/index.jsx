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
import FormTextarea from 'components/forms/form-textarea';

// eslint-disable-next-line no-unused-vars
const RenderTextarea = ( { input, meta, ...props } ) => <FormTextarea { ...input } { ...props } />;

const ReduxFormTextarea = props => <Field component={ RenderTextarea } { ...props } />;

ReduxFormTextarea.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextarea;
