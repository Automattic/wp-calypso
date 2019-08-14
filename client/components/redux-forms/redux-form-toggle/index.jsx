/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'react-final-form';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle/compact';

const ToggleRenderer = ( { input, meta, text, type, ...otherProps } ) => (
	<FormToggle { ...input } { ...otherProps }>
		{ text }
	</FormToggle>
);

const ReduxFormToggle = props => (
	<Field component={ ToggleRenderer } type="checkbox" { ...props } />
);

ReduxFormToggle.propTypes = {
	name: PropTypes.string.isRequired,
	text: PropTypes.string,
};

export default ReduxFormToggle;
