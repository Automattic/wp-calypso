/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormTextarea from 'components/forms/form-textarea';

// eslint-disable-next-line no-unused-vars
const RenderTextarea = ( { input, meta, type, ...otherProps } ) => {
	return (
		<FormTextarea { ...input } { ...otherProps } ></FormTextarea>
	);
};

class ReduxFormTextarea extends PureComponent {
	static propTypes = {
		name: PropTypes.string.isRequired,
	};

	render() {
		return <Field component={ RenderTextarea } type="text" { ...this.props } />;
	}
}

export default ReduxFormTextarea;
