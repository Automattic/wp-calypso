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
import FormSelect from 'components/forms/form-select';

// eslint-disable-next-line no-unused-vars
const RenderSelect = ( { input, meta, ...props } ) => <FormSelect { ...input } { ...props } />;

const ReduxFormSelect = props => <Field component={ RenderSelect } { ...props } />;

ReduxFormSelect.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormSelect;
