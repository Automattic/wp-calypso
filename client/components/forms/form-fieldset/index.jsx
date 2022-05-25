import classnames from 'classnames';

import './style.scss';

const FormFieldset = ( { className = '', children, ...otherProps } ) => (
	<fieldset role="group" { ...otherProps } className={ classnames( className, 'form-fieldset' ) }>
		{ children }
	</fieldset>
);

export default FormFieldset;
