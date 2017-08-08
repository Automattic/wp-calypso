/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { Field } from 'redux-form';

/**
 * Internal dependencies
 */
import FormTextarea from 'components/forms/form-textarea';

// eslint-disable-next-line no-unused-vars
const RenderTextarea = ( { input, meta, type, ...otherProps } ) => {
	return (
		<FormTextarea { ...input } { ...otherProps } />
	);
};

const ReduxFormTextarea = ( props ) => (
	<Field component={ RenderTextarea } type="text" { ...props } />
);

ReduxFormTextarea.propTypes = {
	name: PropTypes.string.isRequired,
};

export default ReduxFormTextarea;
