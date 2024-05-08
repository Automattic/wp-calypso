import clsx from 'clsx';

import './style.scss';

const FormFieldset = ( { className = '', children, ...otherProps } ) => (
	<fieldset role="group" { ...otherProps } className={ clsx( className, 'form-fieldset' ) }>
		{ children }
	</fieldset>
);

export default FormFieldset;
