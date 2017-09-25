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
import FormSelect from 'components/forms/form-select';

// eslint-disable-next-line no-unused-vars
const SelectRenderer = ( { input, meta, ...props } ) => <FormSelect { ...input } { ...props } />;

const ReduxFormSelect = props => <Field component={ SelectRenderer } { ...props } />;

ReduxFormSelect.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormSelect;
