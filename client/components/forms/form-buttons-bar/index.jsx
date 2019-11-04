/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const FormButtonsBar = ( { className, children, ...otherProps } ) => (
	<div { ...otherProps } className={ classnames( className, 'form-buttons-bar' ) }>
		{ children }
	</div>
);

export default FormButtonsBar;
