/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormRadio = ( { className, ...otherProps } ) => (
	<input { ...otherProps }
		type="radio"
		className={ classnames( className, 'form-radio' ) }
	/>
);

export default FormRadio;
