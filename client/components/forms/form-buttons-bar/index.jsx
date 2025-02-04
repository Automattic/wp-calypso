import clsx from 'clsx';

import './style.scss';

const FormButtonsBar = ( { className, children, ...otherProps } ) => (
	<div { ...otherProps } className={ clsx( className, 'form-buttons-bar' ) }>
		{ children }
	</div>
);

export default FormButtonsBar;
