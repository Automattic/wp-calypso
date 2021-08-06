import classnames from 'classnames';
import React from 'react';

import './style.scss';

const FormButtonsBar = ( { className, children, ...otherProps } ) => (
	<div { ...otherProps } className={ classnames( className, 'form-buttons-bar' ) }>
		{ children }
	</div>
);

export default FormButtonsBar;
