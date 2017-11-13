/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

const FormSectionHeading = ( { className, children, ...otherProps } ) => (
	<h3 { ...otherProps } className={ classnames( className, 'form-section-heading' ) }>
		{ children }
	</h3>
);

export default FormSectionHeading;
