/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormSelect from 'calypso/components/forms/form-select';

import 'calypso/state/form/init';

const SelectRenderer = ( { input, meta, ...props } ) => <FormSelect { ...input } { ...props } />;

const ReduxFormSelect = ( props ) => <Field component={ SelectRenderer } { ...props } />;

ReduxFormSelect.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormSelect;
