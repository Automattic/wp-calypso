/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const FormTextarea = ( { className, children, ...otherProps } ) => (
	<textarea { ...otherProps }
		className={ classnames( className, 'form-textarea' ) }
	>
		{ children }
	</textarea>
);

export default FormTextarea;
