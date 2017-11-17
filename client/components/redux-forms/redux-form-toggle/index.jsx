/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle/compact';

// eslint-disable-next-line no-unused-vars
const ToggleRenderer = ( { input, meta, text, type, ...otherProps } ) => (
	<FormToggle { ...input } { ...otherProps }>
		{ text }
	</FormToggle>
);

class ReduxFormToggle extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		text: PropTypes.string,
	};

	render() {
		return <Field component={ ToggleRenderer } type="checkbox" { ...this.props } />;
	}
}

export default ReduxFormToggle;
