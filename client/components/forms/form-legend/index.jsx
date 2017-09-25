/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

const FormLegend = ( { className, children, ...otherProps } ) => (
	<legend { ...otherProps }
		className={ classnames( className, 'form-legend' ) }
	>
		{ children }
	</legend>
);

export default FormLegend;
