/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormButtonsBar = ( { className, children, ...otherProps } ) => (
	<div { ...otherProps }
		className={ classnames( className, 'form-buttons-bar' ) }
	>
		{ children }
	</div>
);

export default FormButtonsBar;
